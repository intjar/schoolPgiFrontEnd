import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalComponent } from './portal.component';
import { NotificationComponent } from './notification/notification.component';


const routes: Routes = [
  {
    path: '',
    component: PortalComponent,
    children: [

      {
        path: "dashboard",
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: "master",
        loadChildren: () => import('./master-setting/master-setting.module').then(m => m.MasterSettingModule)
      },
      {
        path: "manage-user",
        loadChildren: () => import('./master-user/master-user.module').then(m => m.MasterUserModule)
      },
      {
        path: "survey",
        loadChildren: () => import('./manage-survey/manage-survey.module').then(m => m.ManageSurveyModule)
      },
      {
        path: "profile",
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'notification',
        component: NotificationComponent
      },
      {
        path: "report",
        loadChildren: () => import('./report/report.module').then(m => m.ReportModule)
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRoutingModule { }