import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ForgetComponent } from './forget/forget.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgOtpInputModule } from 'ng-otp-input';
import { formatTimeCounterPipe } from '../pipes/formate-time-counter.pipe';
import { SharedModule } from '../portal/shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    ForgetComponent,
    formatTimeCounterPipe
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgOtpInputModule,
    SharedModule
  ],
  exports: [
    formatTimeCounterPipe
  ]
  
})
export class AuthModule { }
