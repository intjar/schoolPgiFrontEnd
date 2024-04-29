import { ChangeDetectorRef, Component, EventEmitter, Input, IterableDiffers, Output, ViewChild } from '@angular/core';
import { CreateSurveyComponent } from '../create-survey/create-survey.component';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { Router } from '@angular/router';
import { Common } from 'src/app/commons/common';
import { ToastService } from 'src/app/services/toast';
import { ExcelService } from 'src/app/services/excel.service';
import { NgxPrintElementService } from 'ngx-print-element';

@Component({
  selector: 'view-survey',
  templateUrl: './assign-survey.component.html',
  styleUrls: ['./assign-survey.component.scss']
})
export class AssignSurveyComponent {

  createdById: any;
  assignSurveyArr: any = [];
  isVisible: boolean = false;
  msg: string;
  displayedColumns = ['sn', 'name', 'entity', 'instance', 'role', 'approver', 'reviewer', 'viewer', 'deo'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  viewData: any = [];
  dataEntryLevelArr: any = []
  instanceArr: any = [];
  instanceArrData: any = [];
  levelArr: any = [];
  updateByAllRecord: any = [];
  selectedApproverArr: any = [];
  selectedApproverRecord: any = [];
  viewUpdateData: any = [];
  iterableDiffer: any;
  focus: any;
  instancefilterData: any = [];
  instancefilterValue: any = []
  filterbyLevelData: any = [];
  instanceModel:any;
  keywordModel:string;
  viewButtonModal:boolean = false;
  resultData: any;
  dataUniqueArray: any = [];
  displayStyle = "none";
  searchValue: string = ''
  totalCount: number = 0
  isGenerating: boolean = false;
  assignSurveyAllData: any = [];
  pdfOpen: boolean = false;
  public config = Common.config;
  pageNumber: number = 0
  @Input() assignSurveyId:string = '';
  @Output() backClick: any = new EventEmitter();
  dataEntryModel:any;
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  breadcrums = {
    heading: 'Manage Survey', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey List'},
      { link: 'View Survey', current: true }
    ]
  }
  approverSelectAll:any;
  reviewerSelectAll:any;
  viewerSelectAll:any;
  deoSelectAll:any;
  public scroll = Common.scroll;
  timer:number  = Common.timeout;
  isLoading: boolean = true;
  isDataLoading:boolean = true;

  surveyActionArr:Array<any> = [{
    "id": "AP",
    "name": "Approver",
  },
  {
    "id": "RV",
    "name": "Reviewer",
  },
  {
    "id": "VW",
    "name": "Viewer",
  },
  {
    "id": "DE",
    "name": "Data Entry",
  }];
  
  surveyLevelArr:Array<any> = [];
  surveyInstanceArr:Array<any> = [];
  surveyRoleArr:Array<any> = [];
  actionSurveyModel:any;
  levelSurveyModel:any;
  instanceSurveyModel:any;
  roleSurveyModel:any;
  roleData:Array<any> = [];
  notifySurveyButton:string  = "Notify";
  isNotified:boolean = false;
  heading: any = [];
  selectedQues: any = [];
  constructor(
    private surveyDataEntryService: SurveyDataEntryService, 
    private dataservice: DataService, 
    private iterableDiffers: IterableDiffers,
    private cdref: ChangeDetectorRef,
    public router: Router,
    private toast: ToastService,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    ) {
    this.createdById = (sessionStorage.getItem("userId"));
    this.iterableDiffer = iterableDiffers.find([]).create();
  }

  ngOnInit() {
    this.viewQuesSubques();
   this.assignSurveyData();
   this.scroll(event,'commonScrollTo')
  }


  viewQuesSubques() {
    let data = {
      id: this.assignSurveyId
    }
    this.selectedQues = [];
    this.surveyDataEntryService.getQuestionSubquestion(data).subscribe((res: any) => {
      if (res?.success) {
        this.selectedQues = res?.result;
        this.selectedQues?.map((x: any) => {
          if (!this.heading?.some(item => (item?.domainName == x?.domain?.domainName + (x?.subDomain ? '-' + x?.subDomain?.subDomainName : '')))) {
            this.heading.push({
              domainName: x?.domain?.domainName + (x?.subDomain ? '-' + x?.subDomain?.subDomainName : '')
            })
          }
        })
        this.heading.forEach((element, index) => {
          let ques: any = [];
          let indexNo: any = 0;
          let subIndexNo:any = 0;
          this.selectedQues.forEach((a: any) => {
            if (element?.domainName == a?.domain?.domainName + (a?.subDomain ? '-' + a?.subDomain?.subDomainName : '')) {
              indexNo = a?.sno;
              ques.push({indexNo: indexNo,question:a?.question, valueLogic:a?.valueLogic, weightage:a?.weightage, pointerLogic:a?.pointerLogic})
              if(a?.subQuestion?.length > 0){
                a?.subQuestion.map((subQues:any) => {
                  subIndexNo = subIndexNo + 1;
                  ques.push({indexNo: indexNo+'.'+subIndexNo,question:subQues?.subQuestion})
                });
              }
            } 
            this.heading[index]['question'] = ques;
            // this.heading[index]['valueLogic'] = a?.valueLogic;
            // this.heading[index]['weightage'] = a?.weightage;
            // this.heading[index]['pointerLogic'] = a?.pointerLogic;
          })
        })
      }
      else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess')
    })
  }

  backToSurvey(){
    this.backClick.emit(true)
  }

  payLoads() {
    return {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase() ? this.searchValue.toLowerCase() : '',
    };
  }

  assignSurveyData() {
    let data:any = {
      "id":this.assignSurveyId
    }
    let payload= this.payLoads()
    // let payLoadsViewUser = {
    //   pageNo: 0,
    //   sortOrder: '',
    //   search: '',
    // };

    this.isDataLoading = true;
    this.dataservice.viewSurvey(payload, data).subscribe((res: any) => {
    
      if (res.success == true) {
        this.assignSurveyArr = res?.result?.result;
        this.isNotified = this.assignSurveyArr[0]?.isNotified;
        if(this.assignSurveyArr[0]?.isNotified){
          this.notifySurveyButton = "Notified"
        }else{
          this.notifySurveyButton = "Notify"
        }
         
        this.viewAssignSurveyReport('page', payload);
        this.viewLevelData();
      }else{
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
      this.isDataLoading = false;
    }, (error) => {
      this.isDataLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })

  }

  getAssignedUnassignedLeveldata(action:any, event:any){
    this.surveyLevelArr = [];
    this.surveyRoleArr = [];
    this.surveyInstanceArr = [];
    this.levelSurveyModel = [];
    this.instanceSurveyModel = [];
    this.roleSurveyModel = [];
    if(action?.id == "AP"){
      this.surveyLevelArr = [this.assignSurveyArr[0]?.approverLevelId];
    }else if(action?.id == "RV"){
      this.surveyLevelArr = this.assignSurveyArr[0]?.reviewerLevelId;
    }else if(action?.id == "VW"){
      this.surveyLevelArr = this.assignSurveyArr[0]?.viewerLevelId;
    }else if(action?.id == "DE"){
      this.surveyLevelArr = [this.assignSurveyArr[0]?.deoLevelId];
    }
  }

  getAssignedUnassignedInstanceRoledata(action:any, event:any){
    this.surveyInstanceArr = [];
    this.surveyRoleArr = [];
    this.instanceSurveyModel = [];
    this.roleSurveyModel = [];
    this.getInstancedata(action);
    if(this.actionSurveyModel?.id == "AP"){
      this.surveyRoleArr = [this.assignSurveyArr[0]?.approverRoleId];
    }else if(this.actionSurveyModel?.id == "RV"){
      this.roleData= [];
      let levelRoleData = [];
      action.map((levelData:any)=> {
        if(this.assignSurveyArr[0].reviewerRole[levelData?.levelName]){
          levelRoleData = structuredClone(this.assignSurveyArr[0].reviewerRole[levelData?.levelName]);
          levelRoleData.map((v:any) => Object.assign((v), {level_id: levelData?.id, name:levelData?.levelName + ' - ' + v?.name}))
          this.roleData.push(levelRoleData)
        }
      })
      this.surveyRoleArr = this.roleData?.flat(1);
    }else if(this.actionSurveyModel?.id == "VW"){
      this.roleData= [];
      let levelRoleData = [];
      action.map((levelData:any)=> {
        if(this.assignSurveyArr[0].viewerRole[levelData?.levelName]){
          levelRoleData = structuredClone(this.assignSurveyArr[0].viewerRole[levelData?.levelName]);
          levelRoleData.map((v:any) => Object.assign((v), {level_id: levelData?.id, name:levelData?.levelName + ' - ' + v?.name}))
          this.roleData.push(levelRoleData);
        }
      })
      this.surveyRoleArr = this.roleData?.flat(1);
    }else if(this.actionSurveyModel?.id == "DE"){
      this.surveyRoleArr = [this.assignSurveyArr[0]?.deoRoleId];
    }
  }

  SaveSurveyData(event:any){
    if(this.actionSurveyModel != null && this.levelSurveyModel.length > 0){
      let levelData:any = [];
      this.levelSurveyModel.map((levels:any) => {
        let instanceIds:any = []
        let roleIds:any = []
        this.instanceSurveyModel.find((instanceData:any, i:number) => {
          if (instanceData?.level == levels?.id) {
            instanceIds.push(instanceData?.id)
          }
        });
        this.roleSurveyModel.find((roleData:any, i:number) => {
          if (roleData?.level_id == levels?.id) {
            roleIds.push(roleData?.id);
          }
        });
        let level = {
          "level_id": levels?.id,
          "instance_ids": instanceIds?.length > 0 ? instanceIds.join(','): "",
          "role_ids": roleIds?.length > 0 ? roleIds.join(','): "",
        }
        levelData.push(level)
      });
      
      let data = [
        {
          "survey_id": this.assignSurveyArr[0]?.id,
          "action_code": this.actionSurveyModel?.id,
          "assign_type": event,
          "level": levelData
        }
      ]
      
      this.isDataLoading = true;
      this.dataservice.assignUassignSurvey(data).subscribe((res:any) => {
        if (res.success == true) {
          this.isDataLoading = false;
          this.toast.showMessage(res?.message, '', 'success');
          let payload = this.payLoads()
          this.viewAssignSurveyReport('page', payload);
        }
        else {
          this.isDataLoading = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      }, (error) => {
        this.isDataLoading = false;
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      })
    }else{
      this.toast.showMessage('Action & Level must be selected', '', 'unsuccess');
    }
  }

  notifySurvey(){
    this.isDataLoading = true;
    let data = {
      "surveyId": this.assignSurveyArr[0]?.id,
      "loginId": parseInt(this.createdById),
    }
    
    this.dataservice.notifySurvey(data).subscribe((res:any) => {
      if (res.success == true) {
        this.isDataLoading = false;
        this.notifySurveyButton = "Notified"
        this.isNotified = true;
        this.toast.showMessage(res?.message, '', 'success');
      }
      else {
        this.isDataLoading = false;
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isDataLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  getInstancedata(data:any){
    // Get Instance select values
    if(data.length > 0){
      let ids:any= [];
      data.map((dataIds:any) => {
        ids.push(dataIds?.id)
      });
      let obj = {
        "listIds": ids
      }
      this.surveyInstanceArr = [];
      this.dataservice.viewblocklevelInstance(obj).subscribe((res: any) => {
        if (res?.success) {
          res?.result.forEach(element => {
            let instanceExists = this.surveyInstanceArr.filter((dataEl:any) =>  element?.id == dataEl?.id);
            if(instanceExists.length == 0 && element?.status){
              this.surveyInstanceArr.push(element)
            }
          });
        } else {
          this.toast.showMessage('No Instance Found', '', 'unsuccess');
        }
      }, (error) => {
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      });
    }
  }

  view() {
    if(this.heading.length > 0){
      this.viewButtonModal = true;
      this.displayStyle = "block";
    }else{
      this.toast.showMessage('No Questions Mapped', '', 'unsuccess');
    }
    
  }

  closeViewModal(){
    this.viewButtonModal = false;
    this.displayStyle = "none";
  }

  reviewerLevel(data: any) {
    let levelName: any = [];
    if (data.length > 0) {
      data.map((item: any) => {
        levelName.push(item?.levelName)
      });
      levelName.join(',');
    }
    return levelName;
  }
  viewerLevel(data: any) {
    let levelName: any = [];
    if (data.length > 0) {
      data.map((item: any) => {
        levelName.push(item?.levelName)
      });
      levelName.join(',');
    }
    return levelName;
  }

// Api Changed
  viewmapQuest() {
//     let data = {
//       "id": parseInt(this.assignSurveyArr[0].id)
//     }
//     this.dataservice.viewmapQuestion(data).subscribe((res:any) => {
//       let resSTR = JSON.stringify(res);
//       let resJSON =res
//       // this.value=resJSON
//       if (resJSON.success == true) {
//         let dataSource = resJSON?.result;
//  console.log(resJSON?.result)
// this.resultData = dataSource
//         this.dataUniqueArray = [
//           ...new Set(
//             resJSON?.result.map(
//               (item) => item?.domainId && item?.subDomainId )
//           ),
//         ];
        // setTimeout(() => {
        //   console.log("dataUniqueArray", this.dataUniqueArray);
        // }, 400);

      // }else {
      //    this.showAlert(res?.errorMessage);
      // }
    // })
  }

  // getSurveyById() {
  //   let data = {
  //     surveyId:  this.assignSurveyArr[0]?.id,
  //     isThird: 0,
  //     loginId:this.getSession?.uid
  //   };

  //   // console.log(data)
  //   this.surveyDataEntryService.getDataListById(data).subscribe(
  //     (res: any) => {
  //       let resSTR = JSON.stringify(res);
  //       let resJSON = JSON.parse(resSTR);
  //       let allItemsId: any = [];
  //       // console.log("resJSON", resJSON);

  //       if (resJSON?.[0]) {
  //         this.resultData = resJSON?.[0];
  //         // sub_domain_id
  //         this.dataUniqueArray = [
  //           ...new Set(
  //             resJSON?.[0]?.result_det.map(
  //               (item) => item.domain_id && item.sub_domain_id
  //             )
  //           ),
  //         ];
  //         console.log("dataUniqueArray", this.dataUniqueArray);

  //       } else {
  //         // this.showAlert(res?.errorMessage);
  //       }
  //     },
  //     (error) => {
  //       let message = 'Something went wrong!';
  //       this.showAlert(message);
  //     }
  //   );
  // }

  printData(type: string) {
    let payload = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    this.viewAssignSurveyReport(type, payload);
  }

  filterData(type: string) {
    let payloads = this.payLoads()

    payloads['pageNo'] = 0
    this.viewAssignSurveyReport('page', payloads)
  }
  
  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    let payloads = this.payLoads()
    this.viewAssignSurveyReport('page', payloads)
  }

  viewAssignSurveyReport(type: string, payload: any) {
    this.dataSource = new MatTableDataSource<any>();
    this.isLoading = true;
    var message
    let obj = {
      "loginId": parseInt(this.createdById),
      "surveyId": this.assignSurveyArr[0]?.id,
      "action": "g",
      "updatedData": null
    }
    this.dataservice.viewAssignSurvey(payload,obj).subscribe((res: any) => {       
      if (res.success) {
        this.dataSource = new MatTableDataSource<any>(res?.result);
        this.viewData = structuredClone(res?.result);
        this.viewUpdateData = res;
         this.totalCount = res?.result?.[0].tot_count
        this.isLoading = false;
        this.assignSurveyAllData = structuredClone(res?.result)
        if (type === 'page') {
          this.dataSource = new MatTableDataSource<any>(res?.result);
          this.cdref.detectChanges();
          (this.isLoading = false),
            (this.totalCount = res?.result?.[0].tot_count);
        }
        if (type == 'pdf') {
          this.pdfOpen = true;
          this.isGenerating = true;
          setTimeout(() => {
            this.print.print('print-pdf', this.config);
            this.isGenerating = false;
            this.pdfOpen = false;
          }, 500);
        }
        if (type == 'csv') {
          this.isGenerating = true;
          const headers: any = [
            'User Name',
            'Entity Level',
            'Instance',
            'Role Name',
            'Approver',
            'Reviewer',
            'Viewer',
            'DEO'
          ];
          let responseData = structuredClone(this.assignSurveyAllData);
          responseData.forEach((element: any) => {          
            element['User Name'] = element?.user_name;
            element['Entity Level'] = element?.level_name;
            element['Instance'] = element?.instance_name;
            element['Role Name'] = element?.role_name;
            element['Approver'] = element?.app_is_chk == 1 ?  'Approver' : '';
            element['Reviewer'] = element?.reviw_is_chk == 1 ?  'Reviewer' : '';
            element['Viewer'] = element?.viw_is_chk == 1 ?  'Viewer' : '';
            element['DEO'] = element?.deo_is_chk == 1 ?  'DEO' : '';
          });
          setTimeout(() => {
            this._ExcelService.downloadFile(responseData, 'View_Assign_Survey', headers);
            this.isGenerating = false;
          }, 1000);
        }
      }
      else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        this.dataSource = new MatTableDataSource<any>();       
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
      
    })
  }

  //************************************* Select Data Entry Level section ********************************
  viewLevelData() {
    this.dataEntryLevelArr = []
    let obj =  {
      "isDropDown":null
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

  //************************************* Search section ********************************


  applyFilter(data, action: string) {
    if (action == 'level') {
      if (data.length > 0) {
        const filterObjectArray = (allDataArray, levelFilterArray) => (
          allDataArray.filter( (el: { level_name: any; }) =>
            levelFilterArray.some( (f: { level_name: any; }) =>
                  f.level_name === el.level_name
              )
          )
      );
      this.filterbyLevelData = filterObjectArray(this.viewUpdateData?.result,data);
      this.dataSource = new MatTableDataSource<any>(filterObjectArray(this.viewUpdateData?.result,data));
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;

      this.instanceModel = null;
      // Get Instance select values
        let ids:any= [];
        data.map((dataIds:any) => {
          ids.push(dataIds?.id)
        });
        let obj = {
          "listIds": ids
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
        this.keywordModel = "";
        this.dataSource = new MatTableDataSource<any>(this.viewUpdateData?.result);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
      }
    }
    else if (action == 'isSearchField') {
      if(data?.target?.value.length > 0){
        if(this.dataEntryModel && this.instanceModel){
          if(this.instancefilterData.length > 0){
            let keywordFilters = this.instancefilterData.filter((x:any) => {
              return (
                ( x?.user_name
                  ?.toLocaleLowerCase()
                  .indexOf(data?.target?.value.toLocaleLowerCase()) > -1)
              );
            });
            this.dataSource = new MatTableDataSource<any>(keywordFilters);
            this.dataSource.paginator = this.viewtable;
            this.dataSource.sort = this.sort;
          }else{
            this.dataSource = new MatTableDataSource<any>([]);
            this.dataSource.paginator = this.viewtable;
            this.dataSource.sort = this.sort;
          }
        }else if(this.dataEntryModel){
          if(this.filterbyLevelData.length > 0){
            let keywordFilters = this.filterbyLevelData.filter((x:any) => {
              return (
                ( x?.user_name
                  ?.toLocaleLowerCase()
                  .indexOf(data?.target?.value.toLocaleLowerCase()) > -1)
              );
            });
            this.dataSource = new MatTableDataSource<any>(keywordFilters);
            this.dataSource.paginator = this.viewtable;
            this.dataSource.sort = this.sort;
          }else{
            this.dataSource = new MatTableDataSource<any>([]);
            this.dataSource.paginator = this.viewtable;
            this.dataSource.sort = this.sort;
          }
        }else{
          let keywordFilters = this.viewUpdateData?.result.filter((x:any) => {
            return (
              ( x?.user_name
                ?.toLocaleLowerCase()
                .indexOf(data?.target?.value.toLocaleLowerCase()) > -1)
            );
          });
          this.dataSource = new MatTableDataSource<any>(keywordFilters);
          this.dataSource.paginator = this.viewtable;
          this.dataSource.sort = this.sort;
        }
      }else{
        if(this.dataEntryModel && this.instanceModel){       
          this.dataSource = new MatTableDataSource<any>(this.instancefilterData);
          this.dataSource.paginator = this.viewtable;
          this.dataSource.sort = this.sort;

        }else if(this.dataEntryModel){         
          this.dataSource = new MatTableDataSource<any>(this.filterbyLevelData);
          this.dataSource.paginator = this.viewtable;
          this.dataSource.sort = this.sort;
        }else{
          this.dataSource = new MatTableDataSource<any>(this.viewUpdateData?.result);
          this.dataSource.paginator = this.viewtable;
          this.dataSource.sort = this.sort;
        }
      }

    }
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

  instanceApplyFilter(data) {
    if(data){
      this.instancefilterValue = data?.instance;
      if(this.filterbyLevelData.length > 0){
        let filterData = this.filterbyLevelData.filter( (el: { instance_id: any; }) =>
          el.instance_id == data?.id
        );
        this.instancefilterData = filterData;
        this.dataSource = new MatTableDataSource<any>(filterData);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;        
      }else{        
        this.instancefilterData = [];
        this.keywordModel = "";
        // this.dataSource = new MatTableDataSource<any>(this.viewUpdateData?.result);
        // this.dataSource.paginator = this.viewtable;
        // this.dataSource.sort = this.sort;
      }
    }else{     
      if(this.filterbyLevelData.length > 0 || this.dataEntryModel.length > 0){
        let filterData = this.filterbyLevelData.filter( (el: { instance_id: any; }) =>
          el.instance_id == data?.id
        );
        this.instancefilterData = [];
        this.dataSource = new MatTableDataSource<any>(this.filterbyLevelData);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;       
      }else{       
        this.instancefilterData = [];
        this.keywordModel = "";
        this.dataSource = new MatTableDataSource<any>(this.viewUpdateData?.result);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
      }
    }
  }


  //******************************Approver***************************
  approverSelected(event, index, item) {
    if (event.target.checked) {
      item.app_is_chk = 1
      this.dataSource.filteredData[index].app_is_chk = item?.app_is_chk;
    } else {
      item.app_is_chk = 0
      this.dataSource.filteredData[index].app_is_chk = item?.app_is_chk;
    }
  }
  approverAllSelected() {
    let isAllChecked = (document.getElementById("approverAll-input") as HTMLInputElement).checked;
    let roleArray:any = [];
    roleArray = this.assignSurveyArr[0]?.approverLevelId?.activeRole?.split(',');
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      if (this.assignSurveyArr[0]?.approverLevelId?.levelName == this.dataSource.filteredData[index]?.level_name && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString())) {
        if (isAllChecked != true) {
          this.dataSource.filteredData[index].app_is_chk = 0;
        } else {
          this.dataSource.filteredData[index].app_is_chk = 1;
        }
      }
    })
  }
  approverAllChecked() {
    let flag = 0, count = 0;
    let roleArray:any = [];
    roleArray = this.assignSurveyArr[0]?.approverLevelId?.activeRole?.split(',');
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      if (this.assignSurveyArr[0]?.approverLevelId?.levelName == this.dataSource.filteredData[index]?.level_name && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString())) {
        if (this.dataSource.filteredData[index]?.app_is_chk == 0) {
          flag = 1
        }
      }
      else {
        count += 1
      }
    })

    if (count != this.dataSource.filteredData?.length) {
      if (flag == 1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false
    }
  }

  //******************************Reviewer***************************
  reviewerSelected(event, index, item) {
    if (event.target.checked) {
      item.reviw_is_chk = 1
      this.dataSource.filteredData[index].reviw_is_chk = item?.reviw_is_chk;
    } else {
      item.reviw_is_chk = 0
      this.dataSource.filteredData[index].reviw_is_chk = item?.reviw_is_chk
    }
  }
  reviewerAllSelected() {
    let isAllChecked = (document.getElementById("reviewerAll-input") as HTMLInputElement).checked
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      let flag = 0;
      this.assignSurveyArr[0]?.reviewerLevelId.forEach((reviewData:any) => {
        let roleArray:any = [];
        roleArray = reviewData?.activeRole?.split(',');
        if(reviewData?.levelName == this.dataSource.filteredData[index]?.level_name && (roleArray?.length > 0 && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString()))){
          flag = 1;
        }
      })
      if (flag == 1) {
        if (isAllChecked != true) {
          this.dataSource.filteredData[index].reviw_is_chk = 0;
        } else {
          this.dataSource.filteredData[index].reviw_is_chk = 1;
        }
      }
    })
  }
  reviewerAllChecked() {
    let flag = 0, count = 0;
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      let flagNew = 0;
      this.assignSurveyArr[0]?.reviewerLevelId.forEach((reviewData:any) => {
        let roleArray = reviewData?.activeRole?.split(',');
        if(reviewData?.levelName == this.dataSource.filteredData[index]?.level_name && (roleArray?.length > 0 && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString()))){
          flagNew = 1;
        }
      })
      if (flagNew == 1) {
        if (this.dataSource.filteredData[index]?.reviw_is_chk == 0) {
          flag = 1
        }
      }
      else {
        count += 1
      }
    })
    if (count != this.dataSource.filteredData?.length) {
      if (flag == 1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false
    }

  }
  //******************************Viewer***************************
  viewerSelected(event, index, item) {
    if (event.target.checked) {
      item.viw_is_chk = 1
      this.dataSource.filteredData[index].viw_is_chk = item?.viw_is_chk;
    } else {
      item.viw_is_chk = 0
      this.dataSource.filteredData[index].viw_is_chk = item?.viw_is_chk
    }
  }
  viewerAllSelected() {
    let isAllChecked = (document.getElementById("viewerAll-input") as HTMLInputElement).checked
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      let flag = 0;
      this.assignSurveyArr[0]?.viewerLevelId.forEach((viewerData:any) => {
        let roleArray = viewerData?.activeRole?.split(',');
        if(viewerData?.levelName == this.dataSource.filteredData[index]?.level_name && (roleArray?.length > 0 && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString()))){
          flag = 1;
        }
      })
      if (flag == 1) {
        if (isAllChecked != true) {
          this.dataSource.filteredData[index].viw_is_chk = 0;
        } else {
          this.dataSource.filteredData[index].viw_is_chk = 1;
        }
      }
    })
  }

  viewerAllChecked() {
    let flag = 0, count = 0;
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      let flagNew = 0;
      this.assignSurveyArr[0]?.viewerLevelId.forEach((viewedData:any) => {
        let roleArray = viewedData?.activeRole?.split(',');
        if(viewedData?.levelName == this.dataSource.filteredData[index]?.level_name && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString())){
          flagNew = 1;
        }
      })
      if (flagNew == 1) {
        if (this.dataSource.filteredData[index]?.viw_is_chk == 0) {
          flag = 1
        }
      }
      else {
        count += 1
      }
    })
    if (count != this.dataSource.filteredData?.length) {
      if (flag == 1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false
    }
  }
  //******************************DEO***************************
  deoSelected(event, index, item) {
    if (event.target.checked) {
      item.deo_is_chk = 1
      this.dataSource.filteredData[index].deo_is_chk = item?.deo_is_chk;
    } else {
      item.deo_is_chk = 0
      this.dataSource.filteredData[index].deo_is_chk = item?.deo_is_chk
    }
  }
  deoAllSelected() {
    let isAllChecked = (document.getElementById("deoAll-input") as HTMLInputElement).checked;
    let roleArray:any = [];
    roleArray = this.assignSurveyArr[0]?.deoLevelId?.activeRole?.split(',');
   
    this.dataSource.filteredData?.forEach((item: any, index: number) => {

      if (this.assignSurveyArr[0]?.deoLevelId?.levelName == this.dataSource.filteredData[index]?.level_name && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString())) {
      if (isAllChecked != true) {
          this.dataSource.filteredData[index].deo_is_chk = 0;
        } else {
          this.dataSource.filteredData[index].deo_is_chk = 1;
        }
      }
    })
  }
  deoAllChecked() {
    let flag = 0, count = 0;
    let roleArray:any = [];
    roleArray = this.assignSurveyArr[0]?.deoLevelId?.activeRole?.split(',');
    this.dataSource.filteredData?.forEach((item: any, index: number) => {
      if (this.assignSurveyArr[0]?.deoLevelId?.levelName == this.dataSource.filteredData[index]?.level_name && roleArray?.includes(this.dataSource.filteredData[index]?.role_id?.toString())) {
        if (this.dataSource.filteredData[index]?.deo_is_chk == 0) {
          flag = 1
        }
      }
      else {
        count += 1
      }
    })
    if (count != this.dataSource.filteredData?.length) {
      if (flag == 1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false
    }
  }
  //******************************Assign Survey***************************

  createAssignSurvey(action) {
    if (action == 'assign') {
      this.updateByAllRecord = this.dataSource.filteredData;

      //let message, flag = 0;
      //let object = ['lev_id', 'level_name', 'survey_id', 'user_name'];
      // this.viewUpdateData?.result.map((res: any, i: number) => {
      //   object.map((rem: any) => { delete this.updateByAllRecord[i][rem] });
      //   if (JSON.stringify(this.viewUpdateData?.result[i]) != JSON.stringify(this.dataSource.filteredData[i])) {
      //     flag = 1
      //   }
      // })
      // if (flag != 1) {
      //   message = 'Plese change anything!'
      //   this.showAlert(message)
      //   return
      // }
    let obj = {
      "loginId": parseInt(this.createdById),
      "surveyId": this.assignSurveyArr[0].id,
      "action": "u",
      "updatedData": this.updateByAllRecord
    }
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
    }; 
    this.dataservice.viewAssignSurvey(payloads, obj).subscribe((res: any) => {
      if (res?.success) {
        this.toast.showMessage(res?.message, '', 'success');
        this.cdref.detectChanges();
        this.viewUpdateData.result = this.updateByAllRecord;
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
    }
    else if (action == 'cancel') {
      this.dataSource.filteredData = structuredClone(this.viewUpdateData.result);
    }
  }


  popupReviewerLevel(data: any) {
    let levelName: any = [];
    if (data.length > 0) {
      data.map((item: any) => {
        levelName.push(item?.levelName)
      });
      levelName.join(',');
    }
    return levelName;
  }

  popupReviewerRole(data: any) {
    let reviewerRole: any = [];
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        reviewerRole.push(element + ' - ' + item?.name);
      });
    });
    return reviewerRole.join(',');
  }

  popupViewerLevel(data: any) {
    let levelName: any = [];
    if (data.length > 0) {
      data.map((item: any) => {
        levelName.push(item?.levelName)
      });
      levelName.join(',');
    }
    return levelName;
  }

  popupViewerRole(data: any) {
    let viewerRole: any = [];
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
      viewerRole.push(element + ' - ' + item?.name);
      });
    });
    return viewerRole.join(',');
  }


  checkReviewerRole(data: any, levelName:any, roleName: any) {
    let flag = true
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        if (element == levelName && item?.name == roleName){
          flag = false
        }
      });
    });
    return flag;
  }

  checkViewerRole(data: any, levelName:any, roleName: any) {
    let flag = true
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        if (element == levelName && item?.name == roleName){
          flag = false
        }
      });
    });
    return flag;
  }
}
