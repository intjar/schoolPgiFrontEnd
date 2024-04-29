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
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-assign-survey-report',
  templateUrl: './assign-survey-report.component.html',
  styleUrls: ['./assign-survey-report.component.scss'],
})
export class AssignSurveyReportComponent {
  breadcrums = {
    heading: 'Manage Report', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Report' },
      { link: 'Assign Survey Report', current: true }
    ]
  }

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoading: boolean = false;
  printPage: any = Common;
  pdfOpen: boolean = false
  public config = Common.config;
  levelSearch: string = "";
  isGenerating: boolean = false
  public scroll = Common.scroll
  timer: number = Common.timeout;
  isViewClick: boolean = false;
  dataResponse:Array<any> = [];
  printDataSource:Array<any> = [];
  exportDataSource:Array<any> = [];
  searchValue: string = '';
  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  dataEntryLevelArr: any = []
  instanceArr: any = [];
  instanceModel:any;
  userData = JSON.parse(sessionStorage.getItem("userDetails") as any);
  dataLevelModel:any;
  displayedColumns: string[] = ['sno', 'survey_name', 'level_name','de_assigned', 'de_pending', 'de_in_progress', 'de_submitted','review_assigned', 'review_pending', 'reviewed', 'approve_assigned', 'approve_pending', 'approved'];
  constructor(
    private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService,
    private router: Router
  ) {  
  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.getAssignSurveyReport('page', this.payLoadsViewUser);
    this.viewLevelData();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }


  getAssignSurveyReport(type: string, paylodas: any) {
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
    }
    this.dataservice.assignSurveyReport(paylodas, request).subscribe(
      (res: any) => {
        let resJSON = res;
        if (resJSON?.success) {
          this.totalCount = res?.result?.[0].tot_count ? res?.result?.[0].tot_count : 0;
          let dataSource = resJSON?.result;
          const groupedData = this.groupDataBySurveyName(dataSource);
          this.dataResponse = this.flattenGroupedData(groupedData);
          if (type === 'page') {
            (this.dataSource = new MatTableDataSource<any>(this.dataResponse)),
              (this.isLoading = false);
          }

          this.printDataSource = structuredClone(this.dataResponse);
          this.exportDataSource = structuredClone(resJSON?.result);
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
              'Level Name',
              'Data Entry - School Level - Assigned',
              'Data Entry - School Level - Pending',
              'Data Entry - School Level - In Progress',
              'Data Entry - School Level - Submitted',
              'Reviewer - Block District - Assigned',
              'Reviewer - Block District - Pending',
              'Reviewer - Block District - Reviewed',
              'Approver - National - Assigned',
              'Approver - National - Pending',
              'Approver - National - Approved',
            ];
            let itemData = structuredClone(this.exportDataSource);
            itemData.forEach((element: any) => {
              element['Survey Name'] = element['survey_name'];
              element['Level Name'] = element['level_name'];
              element['Data Entry - School Level - Assigned'] = element['de_assigned'];
              element['Data Entry - School Level - Pending'] = element['de_pending'];
              element['Data Entry - School Level - In Progress'] = element['de_in_progress'];
              element['Data Entry - School Level - Submitted'] = element['de_submitted'];
              element['Reviewer - Block District - Assigned'] = element['review_assigned'];
              element['Reviewer - Block District - Pending'] = element['review_pending'];
              element['Reviewer - Block District - Reviewed'] = element['reviewed'];
              element['Approver - National - Assigned'] = element['approve_assigned'];
              element['Approver - National - Pending'] = element['approve_pending'];
              element['Approver - National - Approved'] = element['approved'];
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'assign-survey-report',
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
    this.getAssignSurveyReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.getAssignSurveyReport('page', this.payLoadsViewUser);
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
    this.getAssignSurveyReport('page', payloads);
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

  surveyNameClick(surveyId: string) {
    this.router.navigate(['portal/report/survey-name-report', surveyId]);
  }


  groupDataBySurveyName(data: any[]): { [key: string]: any[] } {
    const groupedData: { [key: string]: any[] } = {};
    data.forEach((element) => {
      const surveyName = element.survey_name;
      if (!groupedData[surveyName]) {
        groupedData[surveyName] = [];
      }
      groupedData[surveyName].push(element);
    });
    return groupedData;
  }
  
  flattenGroupedData(groupedData: { [key: string]: any[] }): any[] {
    const flattenedData: any[] = [];
    let rowIndex = 0;
    Object.keys(groupedData).forEach((surveyName) => {
      const groupData = groupedData[surveyName];
      const rowspan = groupData.length;
      groupData.forEach((element, index) => {
        // Add the rowspan property to the first row of each group
        if (index === 0) {
          element.survey_name_rowspan = rowspan;
        } else {
          // For subsequent rows, leave the cell empty and set rowspan to 0
          element.survey_name_rowspan = 0;
          element.survey_name = '';
        }
        element.index = ++rowIndex;
        flattenedData.push(element);
      });
    });
    return flattenedData;
  }
  
  
  
}
