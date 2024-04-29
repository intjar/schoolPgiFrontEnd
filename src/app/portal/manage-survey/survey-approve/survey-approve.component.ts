import { Component } from '@angular/core';

@Component({
  selector: 'app-survey-approve',
  templateUrl: './survey-approve.component.html',
  styleUrls: ['./survey-approve.component.scss']
})
export class SurveyApproveComponent {
  isShowFillSurvey: boolean = false;

  fillSurvey() {
    this.isShowFillSurvey = true
  }
}
