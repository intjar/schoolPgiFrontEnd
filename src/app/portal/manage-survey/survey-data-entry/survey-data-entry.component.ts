import { Component, Pipe, ViewChild } from '@angular/core';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';
import { Router } from '@angular/router';

export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MM-yyyy',
  },
  display: {
    dateInput: 'DD-MM-YYYY ',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-survey-data-entry',
  templateUrl: './survey-data-entry.component.html',
  styleUrls: ['./survey-data-entry.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SurveyDataEntryComponent {
  displayStyle = 'none';
  isShowFillSurvey: boolean = false;
  surveyList: any = [];
  remarkArr: any = []
  displayedColumns = [
    'sn',
    'survey_name',
    'instance_name',
    'financial_year',
    'total_questions',
    'attempted_questions',
    'pending_questions',
    'active_upto',
    'status',
    'action',
  ];
  dataSource = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: any;
  @ViewChild(MatSort) sort: MatSort;
  isVisible: boolean = false;
  msg: string;
  dataId: number;
  status: string = '';
  statusJson: any = Common.dataSurveyStatus;
  isLoading: boolean = true;
  startEndDate: any;
  timer: number = Common.timeout;
  breadCrumsUpdate: any = {};
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  pageNumber: number = 0;
  totalCount: number = 0;
  breadcrums = {
    heading: 'Survey Data Entry',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey Data Entry', current: true },
    ],
  };
  searchFilter: string = '';
  isGenerating: boolean = false;
  exportType: string = '';
  exportAllData: any = []
  pdfOpen: boolean = false
  public config = Common.config;
  createdById: any;
  isSurveyUpload: boolean = false
  yearCode: string | null = null;
  instanceId: number
  constructor(private surveyDataEntryService: SurveyDataEntryService, public print: NgxPrintElementService, private _ExcelService: ExcelService,
    private toast: ToastService, private router: Router) {
    this.createdById = (sessionStorage.getItem("userId"));
  }

  fillSurvey() {
    this.isShowFillSurvey = true;
  }

  ngOnInit(): void {
    this.isSurveyUpload = this.router.url.includes('survey-data-upload');

    this.yearCode = 'All';

     if(this.isSurveyUpload){
      this.breadcrums = {
        heading: 'Survey Data Upload',
        links: [
          { link: 'Dashboard', routing: '/dashboard/dashboard' },
          { link: 'Manage Survey' },
          { link: 'Survey Data Upload', current: true },
        ],
      };
     }


    if(this.isSurveyUpload){
      this.displayedColumns = [
        'sn',
        'survey_name',
        'financial_year',
        'active_upto',
        'status',
        'action',
      ];
    }
    this.getSurveyList();
    this.clearSession();
  }

  GetFinancialYear(data) {
    console.log('data', data)
    this.yearCode = data == 'All' ? 'ALL' : data;
    this.pageNumber = 0;

    this.getSurveyList();
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data;
  //   setTimeout(() => (this.isVisible = false), this.timer);
  // }

  refreshList() {
    //this.showAlert('Successfully processed');
    this.toast.showMessage('Successfully processed', '', 'success');
    this.isShowFillSurvey = false;
    this.getSurveyList();
  }

  getSurveyList() {
    this.toast.dismissSnackBar()
    if (this.exportType == '') {
      this.isLoading = true;
      this.dataSource = new MatTableDataSource<any>();
    }

    //this.searchFilter != '' ? this.pageNumber = 0 : ''
    let data = this.getPayLoads();
    this.exportType != '' ? data['size'] = this.totalCount : data['size'] = 10;
    console.log('data', data)

    this.surveyDataEntryService.getDataList(data).subscribe(
      (res: any) => {
        let resJSON = res;
        console.log('resJSON?.result', resJSON?.result)
        if (resJSON?.result) {
          if (this.exportType == '') {
            let viewtable = structuredClone(resJSON?.result);
            console.log('viewtable', viewtable)
            this.dataSource = new MatTableDataSource<any>(viewtable);
            this.totalCount = resJSON?.result?.[0]?.tot_count;
            this.surveyList = res?.result;
            this.isLoading = false;
          }

          if (this.exportType == 'pdf') {
            this.exportAllData = resJSON?.result;
            setTimeout(() => {
              this.print.print('print-pdf', this.config);
              this.pdfOpen = false
              this.isGenerating = false
              this.exportType = ''
            }, 800);
          }

          if (this.exportType == 'csv') {
            this.exportAllData = resJSON?.result;
            let headers:any = [];
            if(this.isSurveyUpload){
              headers = ['Survey Name', 'Financial Year', 'Active Upto', 'Status']
            }else{
              headers = ['Survey Name', 'Instance Name', 'Financial Year', 'Total Questions', 'Attempted Questions', 'Pending Questions', 'Active Upto', 'Status']
            }
            
            let responseData = structuredClone(this.dataSource.filteredData)
            this.exportAllData.forEach((element: any) => {
              if(this.isSurveyUpload){
                element['Survey Name'] = element['survey_name']
                element['Financial Year'] = element['yr_code']
                element['Active Upto'] = element['active_upto']
                element['Status'] = element['status'] ? 'Active' : 'Inactive';
              }else{
                element['Survey Name'] = element['survey_name']
                element['Instance Name'] = element['instance_name']
                element['Financial Year'] = element['yr_code']
                element['Total Questions'] = element['total_question']
                element['Attempted Questions'] = element['attempted_question']
                element['Pending Questions'] = element['pending_question']
                element['Active Upto'] = element['active_upto']
                element['Status'] = element['status'] ? 'Active' : 'Inactive';
              }
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(this.exportAllData, 'survey_data_entry', headers);
              this.isGenerating = false
              this.exportType = ''
            }, 500);

          }
        } else {
          this.isLoading = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false;
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
  }
  clearSession() {
    sessionStorage.removeItem('formval');
  }
  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.getSurveyList();
    // this.payLoadsViewUser['pageNo'] = this.pageNumber;
    // this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
  }

  getPayLoads() {
    return {
      isThird: this.isSurveyUpload ? 1 : 0,
      loginId: this.getSession?.uid,
      yearcode: (this.yearCode || this.yearCode == 'ALL') ? this.yearCode : Common.setFinanacialYear(),
      pageNo: this.exportType == '' ? this.pageNumber : 0,
      sortOrder: 'desc',
      search: this.searchFilter ? this.searchFilter : '',
      // size: this.totalCount,
    };
  }

  applyFilter(event: any) {
    this.getSurveyList();
  }

  exportData(type: string) {
    this.isGenerating = true
    type == 'pdf' ? this.pdfOpen = true : ''
    this.exportType = type

    this.getSurveyList();

  }

  isDataLoading: boolean = true;
  viewRemark(item: any) {
    this.isDataLoading = true;
    this.remarkArr = []
    let data = {
      "surveyId": item?.survey_id,
      "loginId": item?.deo_id,
    }
    this.surveyDataEntryService.getRemark(data).subscribe((res: any) => {
      if (res?.success) {
        this.remarkArr = res?.result

        this.isDataLoading = false;
      } else {
        this.isDataLoading = false;
      }
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  backToDE() {
    this.yearCode = 'all'
  }
}
