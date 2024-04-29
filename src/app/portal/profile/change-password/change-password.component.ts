import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { Common } from 'src/app/commons/common';
import { ToastService } from 'src/app/services/toast';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  currentPassword: string = 'password';
  newPassword: string = 'password';
  confirmPassword: string = 'password';
  changepasswordForm: FormGroup
  createdById: any;
  isVisible: boolean = false;
  isSubmitted: boolean = false
  msg: string;
  throwError: boolean = false;
  error: boolean = false;
  updating: boolean = false;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'Change Password', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Change Password', current: true }
    ]
  }
  constructor(private dataService: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _location: Location,
    private toast: ToastService
  ) {
    this.changepasswordForm = this.formBuilder.group({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required,
      Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'),
      Validators.minLength(8), Validators.maxLength(20)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { Validators: this.confirmPassword }
    )
    this.createdById = (sessionStorage.getItem("userId"));
  }
  ngOnInit(): void {
    this.toast.dismissSnackBar();
  }

  backToLevel() {
    this._location.back();
  }

  get f() {
    return this.changepasswordForm.controls;
  }
  passwordView(num) {
    if (num == 'one') {

      this.currentPassword == 'password' ? this.currentPassword = 'text' : this.currentPassword = 'password';
    }
    if (num == 'two') {

      this.newPassword == 'password' ? this.newPassword = 'text' : this.newPassword = 'password';
    }
    if (num == 'three') {

      this.confirmPassword == 'password' ? this.confirmPassword = 'text' : this.confirmPassword = 'password';
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    let message
    if (this.changepasswordForm.invalid) {
      return
    } else {
      this.updating = true
      let data = {
        "loggedInUserId": parseInt(this.createdById),
        "currentPassword": this.changepasswordForm.value.currentPassword,
        "newPassword": this.changepasswordForm.value.newPassword,
        "confirmPassword": this.changepasswordForm.value.confirmPassword
      }
      this.dataService.updatePassword(data).subscribe((res) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR)
        if (resJSON?.success == true) {
          this.isSubmitted = false;
          this.updating = false
          this.toast.showMessage('You have successfully updated the password', '', 'success');
          // message = "You have successfully updated the password"
          // this.showAlert(message)
          this.changepasswordForm.reset()
        }
        else {
          this.updating = false
          // message = resJSON?.errorMessage
          // this.showAlert(message)
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        }
      }, (error) => {
        this.updating = false
        // let message = 'Something went wrong!'
        // this.showAlert(message)
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      })
    }
  }

  onCancel() {
    this.changepasswordForm.reset()
    this.isSubmitted = false
    this.throwError = false
    this.error = false
    this.currentPassword = 'password'
    this.newPassword = 'password'
    this.confirmPassword = 'password'
  }

  changePassword(event: any) {
    if (this.changepasswordForm.get('newPassword')?.value !== event?.target?.value) {
      this.throwError = true
    }
    else {
      this.throwError = false
    }
  }

  differentPass(event: any) {
    if (this.changepasswordForm.get('currentPassword')?.value == event?.target?.value) {
      this.error = true
    }
    else {
      this.error = false
    }
  }

  // showAlert(data) {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

}
