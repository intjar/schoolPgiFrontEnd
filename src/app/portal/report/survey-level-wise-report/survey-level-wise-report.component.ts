import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'survey-level-wise-report',
  templateUrl: './survey-level-wise-report.component.html',
  styleUrls: ['./survey-level-wise-report.component.scss']
})
export class SurveyLevelWiseReportComponent {
  breadcrums = {
    heading: 'Manage Report', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Report' },
      { link: 'Survey Level Report', current: true }
    ]
  }
  @Input() surveyLevelData:any = {}
  displayedColumns = [
    'sn',
    'parent_path',
    'instance_name',
    'in_data_entry',
    'in_reveiw',
    'in_approve',
    'completed',
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
  levelArr: any = []
  levelModel:any;
  constructor(
    private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute
  ) {  
  }

  ngOnInit() {
    this.viewLevelData();
    this.surveyId = this.activatedRoute?.snapshot?.paramMap?.get('id') ? this.activatedRoute?.snapshot?.paramMap?.get('id') : this.surveyLevelData?.su_id ? this.surveyLevelData?.su_id : null;
    this.toast.dismissSnackBar();
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getSurveyInstanceListReport('page', this.payLoadsViewUser);
  }

  viewLevelData() {
    this.levelArr = []
    let request = {
      "userId": this.userData?.uid,
      "surveyId":this.surveyLevelData?.su_id 
    }
    this.dataservice.getSurveyLevels(request).subscribe((res: any) => {
      if (res.result) {
        this.levelArr = res?.result?.levelList;
        this.levelModel = this.userData?.levelId;
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
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
      "surveyId":this.surveyLevelData?.su_id,
      "reportLevelId":this.levelModel ? this.levelModel : this.userData?.levelId
    }
    this.dataservice.surveyLevelWiseReport(payloads, request).subscribe(
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
              'Parent Instance',
              'Name',
              'In Data Entry',
              'In Review',
              'In Approved',
              'Completed',
            ];
            let itemData = structuredClone(this.printDataSource);
            itemData.forEach((element: any) => {
              element['Survey Name'] = element['survey_name'];
              element['Parent Instance'] = element['parent_path'];
              element['Name'] = element['instance_name'];
              element['In Data Entry'] = element['in_data_entry'];
              element['In Review'] = element['in_reveiw'];
              element['In Approved'] = element['in_approve'];
              element['Completed'] = element['completed'];
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'survey-level-report',
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

  applyFilter(data:any){
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getSurveyInstanceListReport('page', this.payLoadsViewUser);
  }
}
