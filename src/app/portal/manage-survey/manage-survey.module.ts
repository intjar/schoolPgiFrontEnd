import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageSurveyRoutingModule } from './manage-survey-routing.module';
import { CreateSurveyComponent } from './create-survey/create-survey.component';
import { MapQuestionComponent } from './map-question/map-question.component';
import { AssignSurveyComponent } from './assign-survey/assign-survey.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CloneSurveyComponent } from './clone-survey/clone-survey.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { CommonsModule } from 'src/app/commons/commons.module';
import { SurveyDataEntryComponent } from './survey-data-entry/survey-data-entry.component';
import { DataEntryFormComponent } from './data-entry-form/data-entry-form.component';
import { DataUploadFormComponent } from './data-upload-form/data-upload-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SurveyReviewComponent } from './survey-review/survey-review.component';

import { SurveyApproveComponent } from './survey-approve/survey-approve.component';
import { ApproveFormComponent } from './shared/approve-form/approve-form.component';
import { SharedModule } from '../shared/shared.module';
import { CmnFormComponent } from './data-entry-form/cmn-form/cmn-form.component';
import { DataFormComponent } from './data-entry-form/data-form/data-form.component';
import { CalculationComponent } from './shared/approve-form/calculation/calculation.component';
import { ViewMappedQuestionsComponent } from './shared/view-mapped-questions/view-mapped-questions.component';
import { PdfFormComponent } from './shared/pdf-form/pdf-form.component';
import { PdfCommomComponent } from './shared/pdf-form/pdf-commom/pdf-commom.component';
import { NotifySurveyComponent } from './notify-survey/notify-survey.component';
import { NotifyPopupComponent } from './notify-popup/notify-popup.component';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    CreateSurveyComponent,
    MapQuestionComponent,
    AssignSurveyComponent,
    CloneSurveyComponent,
    SurveyDataEntryComponent,
    DataEntryFormComponent,
    DataUploadFormComponent,
    SurveyReviewComponent,

    SurveyApproveComponent,
    ApproveFormComponent,
    CmnFormComponent,
    DataFormComponent,
    CalculationComponent,
    ViewMappedQuestionsComponent,
    PdfFormComponent,
    PdfCommomComponent,
    NotifySurveyComponent,
    NotifyPopupComponent,


  ],
  imports: [
    CommonModule,
    CommonsModule,
    ManageSurveyRoutingModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    DragDropModule,

  ],
  providers: [
    DatePipe,
  ],
  exports:[
    NotifyPopupComponent,
    ApproveFormComponent,
    PdfFormComponent
  ]
})
export class ManageSurveyModule { }
