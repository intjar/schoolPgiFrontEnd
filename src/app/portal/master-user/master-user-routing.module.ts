import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { ChildUserRegistrationComponent } from './child-user-registration/child-user-registration.component';

const routes: Routes = [
  {
    path : "user",
    component :  UserRegistrationComponent
  },
  {
    path : "instanceuser",
    component :  ChildUserRegistrationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterUserRoutingModule { }
