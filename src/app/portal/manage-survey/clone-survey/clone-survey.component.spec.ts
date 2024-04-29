import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneSurveyComponent } from './clone-survey.component';

describe('CloneSurveyComponent', () => {
  let component: CloneSurveyComponent;
  let fixture: ComponentFixture<CloneSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneSurveyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
