import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignSurveyReportComponent } from './assign-survey-report/assign-survey-report.component';
import { SurveyNameReportComponent } from './survey-name-report/survey-name-report.component';
import { SurveyStatusListReportComponent } from './survey-status-list-report/survey-status-list-report.component';
import { SurveyInstanceListReportComponent } from './survey-instance-list-report/survey-instance-list-report.component';

const routes: Routes = [
  {
    path: 'assign-survey-report',
    component: AssignSurveyReportComponent
  },
  {
    path: 'survey-name-report',
    component: SurveyNameReportComponent
  },
  { path: 'survey-name-report/:id', component: SurveyNameReportComponent },
  { path: 'survey-status-list-report', component: SurveyStatusListReportComponent },
  { path: 'survey-status-list-report/:id', component: SurveyStatusListReportComponent },
  { path: 'survey-instance-list-report', component: SurveyInstanceListReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
