import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { FormBuilder, FormGroup, AbstractControl, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { BehaviorSubject } from 'rxjs';
import { Common } from 'src/app/commons/common';
import { ToastService } from 'src/app/services/toast';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private userDataSource = new BehaviorSubject(undefined);
  roledataString$ = this.userDataSource.asObservable();
  isVisible: boolean = false;
  timer:number  = Common.timeout;
  msg: string;
  saveUserData(value:any){
    this.userDataSource.next(value);
   }

  constructor(
    private router: Router, 
    private formBuilder: FormBuilder, 
    private dataSevice: DataService,    
    private toast: ToastService,
    private auth: AuthService
    ) {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      captcha: new FormControl('', [Validators.required]),
      check: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createCaptcha()
    }, 200);
    this.dataSevice.logout()
  }


  loginForm: any = FormGroup;
  captchaRequired: boolean = false;
  captchaGenerate: string = '';
  viewPassword: string = 'password';
  isValidCaptcha: boolean
  isValidCheck: boolean = false
  message
  isMessage: boolean = false;
  displayStyle = "none";
  userErrormsg = ''
  passErrormsg = ''
  captchaErrormsg = ''
  checkErrormsg =''
  isSend:boolean = false;
  isLocal:boolean = window.location.href.includes('localhost')
  isSubmitted: boolean = false;
  passwordView() {
    this.viewPassword == 'password' ? this.viewPassword = 'text' : this.viewPassword = 'password';
  }
  inputCaptcha() {
    this.isValidCaptcha = false
  }
  inputCheck(val){
    let x = val.target.checked
    // if(x == true){
    //   this.isValidCheck = true
    // }else{
    //   this.isValidCheck = false
    // }
    this.isValidCheck = false


  }

  // ++++++++++++++ Creating captcha for Signin ++++++++++++++++++++
  createCaptcha(refresh: boolean = false, checkRequired: boolean = false) {
    if (refresh) {
      this.loginForm.patchValue({
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

  isPassword: boolean
  isUser: boolean
  PassField(){
    this.isPassword = false
  }
  userField(){
    this.isUser = false
  }
  onChange(isChecked) {
    let isCheckeds = isChecked;
  }
  onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.userErrormsg = ' Please Enter Username';
      this.passErrormsg = 'Please Enter Password';
      this.captchaErrormsg = 'Please Enter Captcha';
      this.checkErrormsg = 'Please accept the Terms of Use'
      return
    } else {
      let data = {
        'username': this.loginForm.value.username.replace(/ {2,}/g, ' ').trim().toLowerCase(),
        'password': this.loginForm.value.password.replace(/ {2,}/g, ' ').trim(),
        'captcha': this.loginForm.value.captcha,
        'check': this.loginForm.value.check
      }
      if ((data.username != undefined) && (data.password != undefined) && (data.captcha === this.captchaGenerate)&&(data.check == true)) {
        let reqData: any = {};
        reqData.loginId = String(data.username);
        reqData.password = String(data.password);
        this.isSend = true;
        this.dataSevice.login(reqData.loginId, reqData.password).subscribe((res: any) => {
          this.dataSevice.saveUserData(res)
          this.isSubmitted = false;
          if (res?.success == true) {
            this.isMessage = false;
            this.dataSevice.userValue(res);
            sessionStorage.setItem('userDetails', JSON.stringify(res))
            sessionStorage.setItem('userId',res?.uid);
            this.getMenusAndPermissions(res?.roleId);
            this.auth.startRefreshTokenTimer();
            //this.router.navigate(['./portal/dashboard/dashboard']);
          }
           else {
            this.isSubmitted = false;
            this.isMessage = true;
            this.loginForm.reset()
            this.createCaptcha()
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');           
            this.displayStyle = "block";
          }
          this.isSend = false;
        },
        (error) => {
          this.isSubmitted = false;
          this.isSend = false;
          this.toast.showMessage('Something Went Wrong', '', 'unsuccess');
        })
      }
      else if (data.captcha != this.captchaGenerate) {
        this.isValidCaptcha = true
        this.captchaErrormsg = 'Please Enter Valid Captcha'
        this.createCaptcha(true,false);
      }else if(data.check == false){
        this.isValidCheck = true
        this.checkErrormsg = 'Please Select Check Box'
      }
    }

  }

  getMenusAndPermissions(id:any){
    let data = {
      "id": id
    }
    this.dataSevice.getMenuAndPermissions(data).subscribe((res:any) => {
      if (res.success == true) {
        let resJSON = JSON.parse(res?.result);
        // Observable and session updated
        this.dataSevice.updateMenuJson(resJSON);
        this.router.navigate(['./portal/dashboard/dashboard']);
      }else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        this.router.navigate(['./login']);
        this.displayStyle = "block";
      }
    },(error)=>{
      this.toast.showMessage('Something went wrong', '', 'unsuccess');    
    })
  }

  forgetpass() {
    this.router.navigate(['./login/forget']);
  }
  closePopup() {
    this.displayStyle = "none";
  }

}
