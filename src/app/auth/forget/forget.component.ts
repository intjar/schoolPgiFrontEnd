import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { Subscription, timer } from 'rxjs';
import { error } from 'jquery';
import { Common } from 'src/app/commons/common';
import { ToastService } from 'src/app/services/toast';
@Component({
  selector: 'app-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.scss']
})
export class ForgetComponent implements OnInit {
  forgetForm: any = FormGroup;
  otpForm: any = FormGroup;
  ressetForm: any = FormGroup;
  isVisible: boolean = false;
  msg;
  userName = ''
  isSubmitted: boolean = false;
  timer:number  = Common.timeout;
  otpMsg = '';
  emailRegxVal = /^[a-zA-Z@.0-9_-]*$/;
  
  constructor(
    private router: Router, 
    private formBuilder: FormBuilder, 
    private dataSevice: DataService,
    private toast: ToastService
    ) {
    this.forgetForm = this.formBuilder.group({
      emailID: new FormControl('', [Validators.required]),
      captcha: new FormControl('', [Validators.required])
    });
    this.otpForm = this.formBuilder.group({
      otp: new FormControl('', [Validators.required]),
    });
    this.ressetForm = this.formBuilder.group({
      newpassword: new FormControl('', [Validators.required]),
      confirmpassword: new FormControl('', [Validators.required]),
    });

  }

  isShowForgetPass: boolean = true
  isShowOTP: boolean = false
  isResetPassword: boolean = false
  viewPassword: string = 'password';
  Confpassword: string = 'password';
  timeLeft: number;
  interval;
  countDown!: Subscription
  ResendOtPCount: number = 10;
  count = 0;
  countNew = 90;
  isResendOtpSend: boolean = false;
  inputOtpData: any;
  otpSend: boolean = false;
  forgotOtpSend:boolean = false;
  verifyOtpSend:boolean = false;
  regexp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!_@$%^&*-]).{8,20}$/;
  isLoading:boolean = false
  @ViewChild('ngOtpInput') ngOtpInputRef: any;
  loadingResend:boolean = false
  captchaRequired: boolean = false;
  captchaGenerate: string = '';
  isValidCaptcha: boolean;
  captchaErrormsg = ''
  ngOnInit(): void {
    setTimeout(() => {
      this.createCaptcha()
    }, 100);
    this.countDown = timer(0, 1000).subscribe(() => { (this.countNew > 0 ? --this.countNew : 0) });
  }

  ngOnDestroy() {
    this.countDown = null as any;
  }


  inputCaptcha() {
    this.isValidCaptcha = false
  }

  //***************************** OTP section ********************/
  config = {
    length: 6,
    allowNumbersOnly: true
  };

  onOtpChange(otp) {
    this.isSubmitted = false
    this.inputOtpData = otp;
  }

  // ++++++++++++++ Creating captcha for Signin ++++++++++++++++++++
  createCaptcha(refresh: boolean = false, checkRequired: boolean = false) {
    if (refresh) {
      this.forgetForm.patchValue({
        captcha: ''
      })
    }
    checkRequired ? this.captchaRequired = true : this.captchaRequired = false;
    this.captchaGenerate = Math.floor(100000 + Math.random() * 900000).toString();
    let id: any = document.getElementById('captcha')
    id.innerHTML = ''
    let canv: any = document.createElement("canvas");
    canv.id = "captcha";
    canv.width = 100;
    canv.height = 30;
    let ctx: any = canv.getContext("2d");
    ctx.font = "25px Georgia";
    ctx.strokeText(this.captchaGenerate, 0, 20);
    id.append(canv);
  }

  sendOTP() {
    if (this.forgetForm.invalid) {
      // let message = 'Please Enter Valid Email!'
      // this.showAlert(message)
      this.captchaErrormsg = 'Please Enter Captcha';
      this.toast.showMessage('Please Enter Valid Email', '', 'unsuccess');
      return
    } else {
      if (this.forgetForm.value.emailID != undefined  && (this.forgetForm.value.captcha === this.captchaGenerate)) {
        this.isResetPassword = false;
        this.userName = this.forgetForm.value.emailID.replace(/ {2,}/g, ' ').trim();
        var obj = {
          "email": this.userName.toLowerCase(),
        };
        this.forgotOtpSend = true;
        this.dataSevice.sendotp(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.otpSend = true;
            this.countNew = 90;
            this.isShowOTP = true;
            this.isShowForgetPass = false;
            // let message = "OTP Send Successfully"
            // this.showAlert(message)
            this.toast.showMessage('OTP Send Successfully', '', 'success');
            
          }
          else {
            this.isShowForgetPass = true;
            // let message = resJSON?.errorMessage
            // this.showAlert(message)
            this.createCaptcha()
            this.forgetForm.reset();
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          }
          this.forgotOtpSend = false;
        }, (error) => {
          this.forgotOtpSend = false;
          this.isShowForgetPass = true;
          this.isSubmitted = false
          this.createCaptcha()
          this.forgetForm.reset();
          // let message = 'Something went wrong!'
          // this.showAlert(message)
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        })
      }else if (this.forgetForm.value.captcha != this.captchaGenerate) {
        if(+this.forgetForm.value.captcha.length < 6){
          this.isValidCaptcha = true
          this.captchaErrormsg = 'Captcha is not complete'
        }else{
          this.isValidCaptcha = true
          this.captchaErrormsg = 'Please Enter Valid Captcha'
          this.createCaptcha(true,false);
        }
      }
    }
  }


  resendOTP() {
    this.count += 1
    this.isResendOtpSend = false;
    this.loadingResend = true
    let myInterval: any = setInterval(() => {
      this.count += 1
      if (this.count > 10) {
        this.count = 0
        clearInterval(myInterval)
      }
    }, 1000);
    this.userName = this.forgetForm.value.emailID;
    var obj = {
      "email": this.userName.toLowerCase(),
    };

    this.ngOtpInputRef?.setValue('');
    this.dataSevice.sendotp(obj).subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);

      if (resJSON.success == true) {
        this.isResendOtpSend = true;
        this.loadingResend = false
        this.countNew = 90;
      }
      else {
        this.isResendOtpSend = true;
        this.loadingResend = false
        // let message = resJSON?.errorMessage;
        // this.showAlert(message)
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
      }

    }, (error) => {
      this.isResendOtpSend = true;
      this.isSubmitted = false
      this.loadingResend = false
      // let message = 'Something went wrong!'
      // this.showAlert(message)
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  VerifyOTP() {
    this.isSubmitted = true
    if ((this.inputOtpData == undefined)) {
      this.otpMsg = 'Please enter OTP.'
      return
    }else if(this.inputOtpData.length != this.config.length){
      this.otpMsg = 'Please enter a valid OTP.'
    }
    else {
      if (this.inputOtpData != undefined) {
        var obj = {
          "email": this.userName.toLowerCase(),
          "otp": this.inputOtpData
        }
        this.verifyOtpSend = true;
        this.dataSevice.otpVerify(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false
          if (resJSON.success == true) {
            this.isShowOTP = false
            this.isResetPassword = true
            // let message = 'OTP has been verified successfully'
            // this.showAlert(message)
            this.toast.showMessage('OTP has been verified successfully', '', 'success');
            
          }
          else {
            this.isShowOTP = true
            // let message = resJSON.errorMessage
            // this.showAlert(message)
            this.toast.showMessage(resJSON.errorMessage, '', 'unsuccess');

          }
          this.verifyOtpSend = false;
        }, (error) => {
          this.verifyOtpSend = false;
          this.isSubmitted = false
          // let message = 'Something went wrong!'
          // this.showAlert(message)
          this.toast.showMessage('Something went wrong', '', 'unsuccess');

        })
      }
    }

  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

  //***************************** Reset Password section ********************/
  backtologin() {
    this.router.navigate(['./login']);
  }
  passwordView() {
    this.viewPassword == 'password' ? this.viewPassword = 'text' : this.viewPassword = 'password';
  }
  passwordView2() {
    this.Confpassword == 'password' ? this.Confpassword = 'text' : this.Confpassword = 'password';
  }

  resetBack() {
    this.isShowOTP = true;
    this.isShowForgetPass = false;
    this.isResetPassword = false;
  }

  ressetPassForm() {
    this.isLoading = true
    if (this.ressetForm.invalid) {
      this.isLoading = false
      return
    } else {
      let data = {
        'newpassword': this.ressetForm.value.newpassword.replace(/ {2,}/g, ' ').trim(),
        'confirmpassword': this.ressetForm.value.confirmpassword.replace(/ {2,}/g, ' ').trim()
      }
      if ((data.newpassword != undefined) && (data.confirmpassword != undefined)) {
        if (data.newpassword === data.confirmpassword) {
          let obj = {
            'email': this.userName.toLowerCase(),
            'password': data.newpassword,
            'confirmPassword': data.confirmpassword
          }
          this.dataSevice.resetpassword(obj).subscribe(res => {
            let resSTR = JSON.stringify(res);
            let resJSON = JSON.parse(resSTR);
            if (resJSON.success == true) {
              this.isLoading = false
              // let message = "Password Change Successfully"
              // this.showAlert(message)
              this.toast.showMessage('Password Change Successfully', '', 'success');
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1000);
            }
            else{
              this.isLoading = false
            }
          },(error) =>{
            this.isLoading = false
            // let message = "Something went wrong!"
            // this.showAlert(message)
            this.toast.showMessage('Something went wrong', '', 'unsuccess');

          })
        } else {
          this.isLoading = false
          // let message = "Password does not match"
          // this.showAlert(message)
          this.toast.showMessage('Password does not match', '', 'unsuccess');

        }
      }

    }
  }

  checkPass() {
    if (!this.ressetForm.get('newpassword')?.value) {
      this.ressetForm.controls['newpassword'].setErrors({
        required: true,
      });
    }
    else if (
      this.ressetForm.get('newpassword')?.value?.match(this.regexp) == null
    ) {
      this.ressetForm.controls['newpassword'].setErrors({
        invalid: true,
      });
    }
  }
}
