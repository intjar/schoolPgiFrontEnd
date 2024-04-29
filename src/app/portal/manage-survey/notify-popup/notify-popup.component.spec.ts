import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyPopupComponent } from './notify-popup.component';

describe('NotifyPopupComponent', () => {
  let component: NotifyPopupComponent;
  let fixture: ComponentFixture<NotifyPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotifyPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
