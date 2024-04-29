import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyInstanceListReportComponent } from './survey-instance-list-report.component';

describe('SurveyInstanceListReportComponent', () => {
  let component: SurveyInstanceListReportComponent;
  let fixture: ComponentFixture<SurveyInstanceListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyInstanceListReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyInstanceListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
