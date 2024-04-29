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


@Component({
  selector: 'app-notify-survey',
  templateUrl: './notify-survey.component.html',
  styleUrls: ['./notify-survey.component.scss']
})
export class NotifySurveyComponent {
  createdById: any;
  assignSurveyArr: any = [];
  isVisible: boolean = false;
  msg: string;

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
  instanceModel: any;
  keywordModel: string;
  viewButtonModal: boolean = false;
  resultData: any;
  dataUniqueArray: any = [];
  displayStyle = "none";
  @Input() assignSurveyId: string = '';
  @Output() backClick: any = new EventEmitter();
  @Input() isNotifyTpd: boolean = false;
  dataEntryModel: any;
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  breadcrums = {
    heading: 'Notify Survey to Users', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Notify Survey', current: true }
    ]
  }
  approverSelectAll: any;
  reviewerSelectAll: any;
  viewerSelectAll: any;
  deoSelectAll: any;
  public scroll = Common.scroll;
  timer: number = Common.timeout;
  isLoading: boolean = true;
  isDataLoading: boolean = true;

  surveyActionArr: Array<any> = [{
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

  surveyLevelArr: Array<any> = [];
  surveyInstanceArr: Array<any> = [];
  surveyRoleArr: Array<any> = [];
  actionSurveyModel: any;
  levelSurveyModel: any;
  instanceSurveyModel: any;
  roleSurveyModel: any;
  roleData: Array<any> = [];
  notifySurveyButton: string = "Notify";
  isNotified: boolean = false;
  isShowPopup: boolean = false;
  modalText: string = "Are you sure you want to Notify this Survey?"
  constructor(private surveyDataEntryService: SurveyDataEntryService, private dataservice: DataService, private iterableDiffers: IterableDiffers, private cdref: ChangeDetectorRef, public router: Router, private toast: ToastService) {
    this.createdById = (sessionStorage.getItem("userId"));
    this.iterableDiffer = iterableDiffers.find([]).create();
  }

  ngOnInit() {
    if(this.isNotifyTpd){
      this.notifySurveyButton = "Notify TPD";
      this.modalText = "Are you sure you want to Notify TPD this Survey?";
      this.breadcrums = {
        heading: 'Notify Survey to Users', links: [
          { link: 'Dashboard', routing: '/dashboard/dashboard' },
          { link: 'Manage Survey' },
          { link: 'Notify TPD Survey', current: true }
        ]
      }
    }else{
      this.notifySurveyButton = "Notify";
      this.modalText = "Are you sure you want to Notify this Survey?"
    }
    this.assignSurveyData();
  }

  backToSurvey() {
    this.backClick.emit(true)
  }

  assignSurveyData() {
    let data: any = {
      "id": this.assignSurveyId
    }
    let payLoadsViewUser = {
      pageNo: 0,
      sortOrder: '',
      search: '',
    };

    this.isDataLoading = true;
    this.dataservice.viewSurvey(payLoadsViewUser, data).subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.success == true) {
        this.assignSurveyArr = resJSON?.result?.result;
        if(this.isNotifyTpd){
         
          this.isNotified = this.assignSurveyArr[0]?.isNotifiedTpd;
          if (this.assignSurveyArr[0]?.isNotifiedTpd) {
            this.notifySurveyButton = "Notified TPD"
          } else {
            this.notifySurveyButton = "Notify TPD"
          }
        }else{
          this.isNotified = this.assignSurveyArr[0]?.isNotified;
          if (this.assignSurveyArr[0]?.isNotified) {
            this.notifySurveyButton = "Notified"
          } else {
            this.notifySurveyButton = "Notify"
          }
        }
        
      } else {
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
      this.isDataLoading = false;
    }, (error) => {
      this.isDataLoading = false;
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  getAssignedUnassignedLeveldata(action: any, event: any) {
    this.surveyLevelArr = [];
    this.surveyRoleArr = [];
    this.surveyInstanceArr = [];
    this.levelSurveyModel = [];
    this.instanceSurveyModel = [];
    this.roleSurveyModel = [];
    if (action?.id == "AP") {
      this.surveyLevelArr = [this.assignSurveyArr[0]?.approverLevelId];
    } else if (action?.id == "RV") {
      this.surveyLevelArr = this.assignSurveyArr[0]?.reviewerLevelId;
    } else if (action?.id == "VW") {
      this.surveyLevelArr = this.assignSurveyArr[0]?.viewerLevelId;
    } else if (action?.id == "DE") {
      this.surveyLevelArr = [this.assignSurveyArr[0]?.deoLevelId];
    }
  }

  getAssignedUnassignedInstanceRoledata(action: any, event: any) {
    this.surveyInstanceArr = [];
    this.surveyRoleArr = [];
    this.instanceSurveyModel = [];
    this.roleSurveyModel = [];
    this.getInstancedata(action);
    if (this.actionSurveyModel?.id == "AP") {
      this.surveyRoleArr = [this.assignSurveyArr[0]?.approverRoleId];
    } else if (this.actionSurveyModel?.id == "RV") {
      this.roleData = [];
      let levelRoleData = [];
      action.map((levelData: any) => {
        if (this.assignSurveyArr[0].reviewerRole[levelData?.levelName]) {
          levelRoleData = structuredClone(this.assignSurveyArr[0].reviewerRole[levelData?.levelName]);
          levelRoleData.map((v: any) => Object.assign((v), { level_id: levelData?.id, name: levelData?.levelName + ' - ' + v?.name }))
          this.roleData.push(levelRoleData)
        }
      })
      this.surveyRoleArr = this.roleData?.flat(1);
    } else if (this.actionSurveyModel?.id == "VW") {
      this.roleData = [];
      let levelRoleData = [];
      action.map((levelData: any) => {
        if (this.assignSurveyArr[0].viewerRole[levelData?.levelName]) {
          levelRoleData = structuredClone(this.assignSurveyArr[0].viewerRole[levelData?.levelName]);
          levelRoleData.map((v: any) => Object.assign((v), { level_id: levelData?.id, name: levelData?.levelName + ' - ' + v?.name }))
          this.roleData.push(levelRoleData);
        }
      })
      this.surveyRoleArr = this.roleData?.flat(1);
    } else if (this.actionSurveyModel?.id == "DE") {
      this.surveyRoleArr = [this.assignSurveyArr[0]?.deoRoleId];
    }
  }

  SaveSurveyData(event: any) {
    if (this.actionSurveyModel != null && this.levelSurveyModel.length > 0) {
      let levelData: any = [];
      this.levelSurveyModel.map((levels: any) => {
        let instanceIds: any = []
        let roleIds: any = []
        this.instanceSurveyModel.find((instanceData: any, i: number) => {
          if (instanceData?.level == levels?.id) {
            instanceIds.push(instanceData?.id)
          }
        });
        this.roleSurveyModel.find((roleData: any, i: number) => {
          if (roleData?.level_id == levels?.id) {
            roleIds.push(roleData?.id);
          }
        });
        let level = {
          "level_id": levels?.id,
          "instance_ids": instanceIds?.length > 0 ? instanceIds.join(',') : "",
          "role_ids": roleIds?.length > 0 ? roleIds.join(',') : "",
        }
        levelData.push(level)
      });

      let data = [
        {
          "survey_id": this.assignSurveyArr[0]?.id,
          "action_code": this.actionSurveyModel?.id,
          "assign_type": event,
          "level": levelData,
          "lg_id": parseInt(this.createdById)
        }
      ]
     

      this.isDataLoading = true;
      this.dataservice.assignUassignSurvey(data).subscribe((res: any) => {
        if (res.success == true) {
          this.isDataLoading = false;
          this.toast.showMessage(res?.message, '', 'success')
        }
        else {
          this.isDataLoading = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isDataLoading = false;

        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {

      this.toast.showMessage('Action & Level must be selected', '', 'unsuccess')
    }
  }

  notifySurvey(event: boolean) {
    if (event) {
      let data = {
        "surveyId": this.assignSurveyArr[0]?.id,
        "loginId": parseInt(this.createdById),
      }
      let serviceName: any = this.dataservice.notifySurvey(data);
      if(this.isNotifyTpd){
        serviceName = this.dataservice.notifyTPDSurvey(data);
      }else{
        serviceName = this.dataservice.notifySurvey(data);
      }
      this.isDataLoading = true;
      
      serviceName.subscribe((res: any) => {
       
        if (res.success == true) {
          this.isDataLoading = false;
          this.isShowPopup = false;
          this.notifySurveyButton = this.isNotifyTpd ? "Notified TPD" : "Notified";
          this.isNotified = true;
          this.toast.showMessage(res?.message, '', 'success')
        }
        else {
          this.isDataLoading = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isDataLoading = false;
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isShowPopup = false;
    }
  }

  getInstancedata(data: any) {
    // Get Instance select values
    if (data.length > 0) {
      let ids: any = [];
      data.map((dataIds: any) => {
        ids.push(dataIds?.id)
      });
      let obj = {
        "listIds": ids
      }
      this.surveyInstanceArr = [];
      this.dataservice.viewblocklevelInstance(obj).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success == true) {
          resJSON?.result.forEach(element => {
            let instanceExists = this.surveyInstanceArr.filter((dataEl: any) => element?.id == dataEl?.id);
            if (instanceExists.length == 0 && element?.status) {
              this.surveyInstanceArr.push(element)
            }
          });
        } else {
          this.toast.showMessage("No Instance Found", '', 'unsuccess')
        }
      }, (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      });
    }
  }

  view() {
    this.viewButtonModal = true;
    this.displayStyle = "block";
    //this.getSurveyById();
    this.viewmapQuest();
  }

  closeViewModal() {
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


  //************************************* Search section ********************************


  showTitle(item: any, action: string) {
    let title: any = []
    if (action == 'dataentrylevel') {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.level_name)
      });
    } else {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.instanceName)
      });
    }
    return title.join('\n')
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


  checkReviewerRole(data: any, levelName: any, roleName: any) {
    let flag = true
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        if (element == levelName && item?.name == roleName) {
          flag = false
        }
      });
    });
    return flag;
  }

  checkViewerRole(data: any, levelName: any, roleName: any) {
    let flag = true
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        if (element == levelName && item?.name == roleName) {
          flag = false
        }
      });
    });
    return flag;
  }

  // for View Mapped Question

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

}
