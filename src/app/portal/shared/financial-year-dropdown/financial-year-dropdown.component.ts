import { Component, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-financial-year-dropdown',
  templateUrl: './financial-year-dropdown.component.html',
  styleUrls: ['./financial-year-dropdown.component.scss']
})
export class FinancialYearDropdownComponent {
  constructor(private dataservice: DataService,
    private toast: ToastService) {
  }
  @Output() financialYear: EventEmitter<any> = new EventEmitter();
  financialYearArr: any = [];
  // year: string = Common.setFinanacialYear(); //filter by current year
  year: string = 'All'; // Filter by All

  ngOnInit() {
    this.viewFinancialYear();

  }

  selectFinancialYear(selectedItem: any) {
    this.financialYear.emit(selectedItem?.yearCode ? selectedItem?.yearCode : selectedItem);
  }

  viewFinancialYear() {
    this.financialYearArr = [];
    this.dataservice.viewYear().subscribe((res: any) => {
      if (res?.success) {
        this.financialYearArr = res?.result;
      } else {
        this.toast.showMessage(res?.message, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }


}
