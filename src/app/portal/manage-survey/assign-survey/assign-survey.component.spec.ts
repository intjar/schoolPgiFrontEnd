import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSurveyComponent } from './assign-survey.component';

describe('AssignSurveyComponent', () => {
  let component: AssignSurveyComponent;
  let fixture: ComponentFixture<AssignSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignSurveyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
