import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
  selector: 'survey-instance-list-report',
  templateUrl: './survey-instance-list-report.component.html',
  styleUrls: ['./survey-instance-list-report.component.scss']
})
export class SurveyInstanceListReportComponent {
  breadcrums = {
    heading: 'Manage Report', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Report' },
      { link: 'Survey Instance Wise Report', current: true }
    ]
  }
  @Input() surveyData:any = {}
  displayedColumns = [
    'sn',
    'survey_name',
    'survey_level_name',
    'survey_instance_name',
    'reviewer_level_name',
    'reviewer_instance_name',
    'approver_level_name',
    'approver_instance_name',
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
  surveyId:string | null = '';
  displayStyle = 'none';
  isPDF:boolean = false;
  currentTime: Date = new Date();
  @Output() backClick: any = new EventEmitter();
  showSurveyLevelReport:boolean = false;
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
    this.surveyId = this.activatedRoute?.snapshot?.paramMap?.get('id') ? this.activatedRoute?.snapshot?.paramMap?.get('id') : this.surveyData?.su_id ? this.surveyData?.su_id : null;
    this.toast.dismissSnackBar();
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getSurveyInstanceListReport('page', this.payLoadsViewUser);
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }
  

  getSurveyInstanceListReport(type: string, payloads: any) {
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];
    payloads['search'] = this.searchValue
    let request = {
      "userId": this.userData?.uid,
      "surveyId":this.surveyData?.su_id 
    }
    this.dataservice.surveyInstanceListReport(payloads, request).subscribe(
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
              'Survey Level',
              'Survey Instance',
              'Reviewer Level',
              'Reviewer Instance',
              'Approver Level',
              'Approver Instance',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);
            itemData.forEach((element: any) => {
              element['Survey Name'] = element['survey_name'];
              element['Survey Level'] = element['survey_level_name'];
              element['Survey Instance'] = element['survey_instance_name'];
              element['Reviewer Level'] = element['reviewer_level_name'];
              element['Reviewer Instance'] = element['reviewer_instance_name'];
              element['Approver Level'] = element['approver_level_name'];
              element['Approver Instance'] = element['approver_instance_name'];
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
    this.getSurveyInstanceListReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.getSurveyInstanceListReport('page', this.payLoadsViewUser);
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
    this.getSurveyInstanceListReport('page', payloads);
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
  
  backClickbutton(){
    this.backClick.emit(true)
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

  backButtonClick() {
    this.toast.dismissSnackBar();
    this.searchValue = "";
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: "",
    };
    this.getSurveyInstanceListReport('page', payloads);
  }

  getLevelWiseSurveyList(element:any){
    //this.surveyData = element;
    this.showSurveyLevelReport = true;
  }

}
