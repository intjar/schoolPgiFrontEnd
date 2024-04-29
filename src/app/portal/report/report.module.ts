import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { AssignSurveyReportComponent } from './assign-survey-report/assign-survey-report.component';
import { SurveyNameReportComponent } from './survey-name-report/survey-name-report.component';
import { SharedModule } from '../shared/shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApproveFormComponent } from '../manage-survey/shared/approve-form/approve-form.component';
import { ManageSurveyModule } from '../manage-survey/manage-survey.module';
import { SurveyStatusListReportComponent } from './survey-status-list-report/survey-status-list-report.component';
import { SurveyInstanceListReportComponent } from './survey-instance-list-report/survey-instance-list-report.component';
import { SurveyLevelWiseReportComponent } from './survey-level-wise-report/survey-level-wise-report.component';


@NgModule({
  declarations: [
    AssignSurveyReportComponent,
    SurveyNameReportComponent,
    SurveyStatusListReportComponent,
    SurveyInstanceListReportComponent,
    SurveyLevelWiseReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NgSelectModule,
    ManageSurveyModule
  ]
})
export class ReportModule { }
