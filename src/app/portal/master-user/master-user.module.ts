import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterUserRoutingModule } from './master-user-routing.module';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CommonsModule } from 'src/app/commons/commons.module';
import { ChildUserRegistrationComponent } from './child-user-registration/child-user-registration.component';

@NgModule({
  declarations: [
    UserRegistrationComponent,
    ChildUserRegistrationComponent,

  ],
  imports: [
    CommonModule,
    CommonsModule,
    MasterUserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],

})
export class MasterUserModule { }
