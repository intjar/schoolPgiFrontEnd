import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-survey-status-list-report',
  templateUrl: './survey-status-list-report.component.html',
  styleUrls: ['./survey-status-list-report.component.scss']
})
export class SurveyStatusListReportComponent {
  breadcrums = {
    heading: 'Manage Report', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Report' },
      { link: 'Survey Status List Report', current: true }
    ]
  }
  displayedColumns = [
    'sn',
    'survey_name',
    'assigned_level_name',
    'year_code',
    'active_duration',
    'status'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoading: boolean = false;
  printPage: any = Common;
  pdfOpen: boolean = false;
  public config = Common.config;
  isGenerating: boolean = false
  public scroll = Common.scroll
  timer: number = Common.timeout;
  printDataSource:Array<any> = [];
  searchValue: string = '';
  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  userData = JSON.parse(sessionStorage.getItem("userDetails") as any);
  surveyStatus:string | null = '';
  displayStyle = 'none';
  isPDF:boolean = false;
  currentTime: Date = new Date();
  showSurveyInstanceList:boolean = false;
  surveyData:any = {};
  filterStatus:string = "";
  constructor(
    private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private surveyDataEntryService: SurveyDataEntryService
  ) {  
  }

  ngOnInit() {
    this.surveyStatus = this.activatedRoute?.snapshot?.paramMap?.get('id');
    
    this.toast.dismissSnackBar();
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getSurveyStatusListReport('page', this.payLoadsViewUser);
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  getStatusClass(status: any) {
    if(status == 1){
      return 'table-row-red';
    }else{
      return '';
    }
  }
  

  getSurveyStatusListReport(type: string, payloads: any) {
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];
    payloads['search'] = this.searchValue
    let request = {
      "userId": this.userData?.uid,
      "filterStatus": this.surveyStatus ? this.surveyStatus : ""
    }
    this.dataservice.surveyStatusListReport(payloads, request).subscribe(
      (res: any) => {
        let resJSON = res;
        if (resJSON?.success) {
          this.totalCount = res?.result?.[0].tot_count ? res?.result?.[0].tot_count : 0;
          let dataSource = resJSON?.result;
          
          this.printDataSource = structuredClone(dataSource);
          if (type === 'page') {
            (this.dataSource = new MatTableDataSource<any>(dataSource)),
              (this.isLoading = false);
          }
          //Export PDF
          if (type === 'pdf') {
            this.pdfOpen = true;
            setTimeout(() => {
              this.print.print('print-pdf', this.config);
              this.pdfOpen = false;
              this.isGenerating = false
            }, 500);
          }
          //Export CSV
          if (type === 'csv') {
            const headers: any = [
              'Survey Name',
              'Assigned Level',
              'Year',
              'Active Duration',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);
            itemData.forEach((element: any) => {
              element['Survey Name'] = element['survey_name'];
              element['Assigned Level'] = element['assigned_level_name'];
              element['Year'] = element['year_code'];
              element['Active Duration'] = element['active_duration'];
              element['Status'] = element['status'];
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'survey-status-list-report',
                headers
              );
              this.isGenerating = false
            }, 500);
          }
        } else {
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          this.dataSource = new MatTableDataSource<any>(); 
          this.totalCount = 0;
          this.isLoading = false;
          this.isGenerating = false
        }
      },
      (error) => {
        this.isLoading = false;
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        this.isGenerating = false
      }
    );
  }

  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    this.getSurveyStatusListReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.getSurveyStatusListReport('page', this.payLoadsViewUser);
  }

  filterData(type: string) {
    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    if(type == 'clear'){
      this.searchValue = '';
      this.toast.dismissSnackBar();
    }
    this.getSurveyStatusListReport('page', payloads);
  }

  printPDF() {
    this.pdfOpen = true;
    this.isGenerating = true
    setTimeout(() => {
      this.print.print('print-pdf', this.config);
      this.pdfOpen = false
      this.isGenerating = false
    }, 500);
  }

  //************************************* Select Data Entry Level section ********************************

  showTitle(item: any, action: string){
    let title: any = []
    if(action == 'dataentrylevel'){
      item.slice(1,item.length)?.forEach((element) => {
        title.push(element?.level_name)
      });
    }else{
      item.slice(1,item.length)?.forEach((element) => {
        title.push(element?.instanceName)
      });
    }
    return title.join('\n')
  }
  
  backClick(){
    this.router.navigate(['portal/report/assign-survey-report']);
  }
  export(event:any){ 
    this.genratePDF()
  }

  genratePDF(){
    this.isPDF = true;
    setTimeout(() => {
      this.print.print('print-ans', this.config);
      this.isPDF = false;
    }, 800);
  }

  getInstanceWiseSurveyList(element:any){
    this.surveyData = element;
    this.showSurveyInstanceList = true;
  }

  backButtonClick() {
    this.toast.dismissSnackBar();
    this.searchValue = "";
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: "",
    };
    this.getSurveyStatusListReport('page', payloads);
  }

  backSurveyClick(){
    this.router.navigate(['portal/dashboard/dashboard']);
  }
}
