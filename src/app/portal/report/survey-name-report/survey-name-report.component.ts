import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-survey-name-report',
  templateUrl: './survey-name-report.component.html',
  styleUrls: ['../assign-survey-report/assign-survey-report.component.scss']
})
export class SurveyNameReportComponent {
  breadcrums = {
    heading: 'Manage Report', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Report' },
      { link: 'Survey Name Report', current: true }
    ]
  }
  displayedColumns = [
    'sn',
    'survey_name',
    'survey_instance_name',
    'user_level',
    'user_instance',
    'assigned_for',
    'assignee_name',
    'status',
    'action'
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoading: boolean = false;
  printPage: any = Common;
  pdfOpen: boolean = false;
  public config = Common.config;
  levelSearch: string = "";
  isGenerating: boolean = false
  public scroll = Common.scroll
  timer: number = Common.timeout;
  isViewClick: boolean = false;
  dataResponse:Array<any> = [];
  printDataSource:Array<any> = [];
  searchValue: string = '';
  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  dataEntryLevelArr: any = []
  instanceArr: any = [];
  instanceModel:any;
  userData = JSON.parse(sessionStorage.getItem("userDetails") as any);
  dataLevelModel:any;
  surveyId:string | null = '';
  resultData: any;
  resultPopup:any =[];
  isShowPopup:boolean = false;
  displayStyle = 'none';
  dataUniqueArray: any = [];
  domainObjectArray:any;
  dataUniqueArrayWithoutSubQuestion: any = [];
  isPDF:boolean = false;
  currentTime: Date = new Date();
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
    this.surveyId = this.activatedRoute?.snapshot?.paramMap?.get('id');
    this.toast.dismissSnackBar();
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getSurveyNameReport('page', this.payLoadsViewUser);
    this.viewLevelData();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }


  getSurveyNameReport(type: string, paylodas: any) {
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];
    paylodas['search'] = this.searchValue
    let request = {
      "loginId": this.userData?.uid,
      "levelId": this.dataLevelModel ? this.dataLevelModel?.id : "0",
      "instanceId": this.instanceModel ? this.instanceModel?.id : "0",
      "surveyId": this.surveyId != null ? +this.surveyId : null
    }
    this.dataservice.surveyNameReport(paylodas, request).subscribe(
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
              'Survey Instance',
              'User Level',
              'User Instance',
              'Assigned For',
              'Assignee Name',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);
            itemData.forEach((element: any) => {
              element['Survey Name'] = element['survey_name'];
              element['Survey Instance'] = element['survey_instance_name'];
              element['User Level'] = element['user_level'];
              element['User Instance'] = element['user_instance'];
              element['Assigned For'] = element['assigned_for'];
              element['Assignee Name'] = element['assignee_name'];
              element['Status'] = element['status'];
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'survey-name-report',
                headers
              );
              this.isGenerating = false
            }, 500);
          }
        } else {
          this.toast.showMessage("asdsd", '', 'unsuccess');
          this.dataSource = new MatTableDataSource<any>(); 
          this.totalCount = 0;
          this.isLoading = false;
          this.isGenerating = false
        }
      },
      (error) => {
        this.isLoading = false;
        // let message = 'Something went wrong!';
        // this.showAlert(message);
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
    this.getSurveyNameReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.getSurveyNameReport('page', this.payLoadsViewUser);
  }

  filterData(type: string) {
    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    if(type == 'clear'){
      this.dataLevelModel = null;
      this.instanceModel = null;
      this.searchValue = '';
      this.toast.dismissSnackBar();
    }
    this.getSurveyNameReport('page', payloads);
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
  viewLevelData() {
    this.dataEntryLevelArr = []
    let obj = {
      "isDropDown": "d"
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe((res: any) => {
      if (res.status) {
        res?.result.forEach(element => {
          this.dataEntryLevelArr.push(element)
        });
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

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

  applyFilter(data, action: string) {
    if (action == 'level') {
      this.instanceModel = null;
      // Get Instance select values
        // let ids:any= [];
        // console.log("data", data);
        
        // data.map((dataIds:any) => {
        //   ids.push(dataIds?.id)
        // });
        let obj = {
          "listIds": [data?.id]
        }
        this.instanceArr = [];
        this.dataservice.viewblocklevelInstance(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            resJSON?.result.forEach(element => {
              let instanceExists = this.instanceArr.filter((dataEl:any) =>  element?.id == dataEl?.id);
              if(instanceExists.length == 0 && element?.status){
                this.instanceArr.push(element)
              }
            });
          } else {
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');

          }
        }, (error) => {
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        });
      }
      else {
        this.instanceArr = [];
        this.instanceModel = null;
      }
  }
  
  backClick(){
    this.router.navigate(['portal/report/assign-survey-report']);
  }

  getSurveyById(element: any) {
    this.toast.dismissSnackBar()
    let data = {
      surveyId: element?.survey_id,
      isThird: 2,
      loginId: this.userData?.uid,
      instanceId: element.instance_id
    };
    this.isLoading = true
    this.surveyDataEntryService.getDataListById(data).subscribe(
      (res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        let allItemsId: any = [];
        if (resJSON?.[0]) {
          this.resultData = resJSON?.[0];
          this.resultPopup = this.resultData?.result_det
          let uniqueQuestionDomainid = [
            ...new Set(
              resJSON?.[0]?.result_det.map(
                (item:any) =>
                {return {'domain':item.domain_id,'subDomain':item.sub_domain_id}}
              )
            ),
          ];

          const arrayUniqueByKey = [...new Map(uniqueQuestionDomainid.map((item:any) =>
            [item['subDomain'], item])).values()];

          this.domainObjectArray = arrayUniqueByKey
          this.dataUniqueArray = [
            ...new Set(
              resJSON?.[0]?.result_det.map(
                (item) => item.domain_id && item.sub_domain_id
              )
            ),
          ];

          this.dataUniqueArrayWithoutSubQuestion = [
            ...new Set(resJSON?.[0]?.result_det.map((item) => item.domain_id)),
          ];

          // this.subDomainArry = [
          //   ...new Set(
          //     resJSON?.[0]?.result_det.map((item) => item.sub_domain_id)
          //   ),
          // ];
          //Filtered Subdomain
          resJSON?.[0]?.result_det.forEach((domSub: any) => {
            allItemsId.push({
              domain: domSub.domain_id,
              sub_domain: domSub.sub_domain_id,
            });
          });

          //Removed Duplicates Fomr Filltered Array
          // this.domainSubDomain = allItemsId.filter(
          //   (thing, index, self) =>
          //     index ===
          //     self.findIndex(
          //       (t) =>
          //         t.domain === thing.domain && t.sub_domain === thing.sub_domain
          //     )
          // );
          this.isLoading = false;
          this.isShowPopup = true;
             
        } else {
          this.isLoading = false
          this.isShowPopup = false
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false
        this.isShowPopup = false   
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
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
}

