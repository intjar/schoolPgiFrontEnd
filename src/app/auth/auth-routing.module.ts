import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetComponent } from './forget/forget.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  // {
  //   path: '', redirectTo:"login", pathMatch:"full"
  // },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "forget",
    component: ForgetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
