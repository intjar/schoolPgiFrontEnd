import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyStatusListReportComponent } from './survey-status-list-report.component';

describe('SurveyStatusListReportComponent', () => {
  let component: SurveyStatusListReportComponent;
  let fixture: ComponentFixture<SurveyStatusListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyStatusListReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyStatusListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
