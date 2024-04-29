import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyApproveComponent } from './survey-approve.component';

describe('SurveyApproveComponent', () => {
  let component: SurveyApproveComponent;
  let fixture: ComponentFixture<SurveyApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
