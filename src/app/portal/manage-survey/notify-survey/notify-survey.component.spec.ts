import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifySurveyComponent } from './notify-survey.component';

describe('NotifySurveyComponent', () => {
  let component: NotifySurveyComponent;
  let fixture: ComponentFixture<NotifySurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotifySurveyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifySurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
