import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialYearDropdownComponent } from './financial-year-dropdown.component';

describe('FinancialYearDropdownComponent', () => {
  let component: FinancialYearDropdownComponent;
  let fixture: ComponentFixture<FinancialYearDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialYearDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialYearDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
