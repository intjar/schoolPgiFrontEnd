import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleMasterComponent } from './role-master/role-master.component';
import { LevelMasterComponent } from './level-master/level-master.component';
import { SchoolMasterComponent } from './school-master/school-master.component';
import { InstanceMasterComponent } from './instance-master/instance-master.component';
import { DomainMasterComponent } from './domain-master/domain-master.component';
import { DataSourceMasterComponent } from './data-source-master/data-source-master.component';
import { QuestionMasterComponent } from './question-master/question-master.component';
import { MediaFileUploadComponent } from './media-file-upload/media-file-upload.component';

const routes: Routes = [
  {
    path: "role",component:RoleMasterComponent
  },
  {
    path: "level",
    component: LevelMasterComponent
  },
  {
    path: "instance",
    component: InstanceMasterComponent
  },
  {
    path: "school",
    component: SchoolMasterComponent
  },
  {
    path: "domain",
    component: DomainMasterComponent
  },
  {
    path: "data-source",
    component: DataSourceMasterComponent
  },
  {
    path: "question",
    component: QuestionMasterComponent
  },
  {
    path: "media-file-upload",
    component: MediaFileUploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterSettingRoutingModule { }
