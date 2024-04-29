import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyLevelWiseReportComponent } from './survey-level-wise-report.component';

describe('SurveyLevelWiseReportComponent', () => {
  let component: SurveyLevelWiseReportComponent;
  let fixture: ComponentFixture<SurveyLevelWiseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyLevelWiseReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyLevelWiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
