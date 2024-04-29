import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MasterSettingRoutingModule } from './master-setting-routing.module';
import { RoleMasterComponent } from './role-master/role-master.component';
import { LevelMasterComponent } from './level-master/level-master.component';
import { SchoolMasterComponent } from './school-master/school-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomainMasterComponent } from './domain-master/domain-master.component';
import { DataSourceMasterComponent } from './data-source-master/data-source-master.component';
import { QuestionMasterComponent } from './question-master/question-master.component';
import { InstanceMasterComponent } from './instance-master/instance-master.component';

import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CommonsModule } from 'src/app/commons/commons.module';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MediaFileUploadComponent } from './media-file-upload/media-file-upload.component';

@NgModule({
  declarations: [
    RoleMasterComponent,
    LevelMasterComponent,
    SchoolMasterComponent,
    DomainMasterComponent,
    DataSourceMasterComponent,
    QuestionMasterComponent,
    InstanceMasterComponent,
    MediaFileUploadComponent,
  ],
  imports: [
    CommonModule,
    CommonsModule,
    MasterSettingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MasterSettingRoutingModule,
    DataTablesModule,
    NgSelectModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
   MatIconModule,
   MatChipsModule,
   MatFormFieldModule,
   MatInputModule,


  ],


})
export class MasterSettingModule { }
