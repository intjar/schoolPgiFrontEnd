import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateSurveyComponent } from './create-survey/create-survey.component';
import { MapQuestionComponent } from './map-question/map-question.component';
import { AssignSurveyComponent } from './assign-survey/assign-survey.component';
import { CloneSurveyComponent } from './clone-survey/clone-survey.component';
import { SurveyDataEntryComponent } from './survey-data-entry/survey-data-entry.component';
import { DataEntryFormComponent } from './data-entry-form/data-entry-form.component';

import { DataUploadFormComponent } from './data-upload-form/data-upload-form.component';
import { SurveyReviewComponent } from './survey-review/survey-review.component';

import { SurveyApproveComponent } from './survey-approve/survey-approve.component';
import { ApproveFormComponent } from './shared/approve-form/approve-form.component';
import { NotifySurveyComponent } from './notify-survey/notify-survey.component';

const routes: Routes = [
  {
    path:"survey",
    component:CreateSurveyComponent
  },
  {
    path:"map-question",
    component:MapQuestionComponent
  },
  {
    path:"assign-survey",
    component:NotifySurveyComponent
  },
  {
    path:"clone-survey",
    component:CloneSurveyComponent
  },
  {
    path:"survey-data-entry",
    component:SurveyDataEntryComponent
  },
  {
    path:"data-entry-form",
    component:DataEntryFormComponent
  },
  {
    path:"survey-data-upload",
    component:SurveyDataEntryComponent
  },
  {
    path:"data-upload-form",
    component:DataUploadFormComponent
  },
  //Review and Approve Component
  {
    path:"survey-review",
    component:SurveyReviewComponent
  },

  {
    path:"survey-approve",
    component:SurveyReviewComponent
  },
  {
    path:"approve-form",
    component:ApproveFormComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageSurveyRoutingModule { }
