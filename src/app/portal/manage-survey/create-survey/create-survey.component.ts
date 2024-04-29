import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { trigger, transition, style, animate } from '@angular/animations';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';


export const MY_FORMATS = {
  parse: {
    dateInput: "dd-MM-yyyy"
  },
  display: {
    dateInput: 'DD-MM-YYYY ',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
@Component({
  selector: 'create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },

  ]
})


export class CreateSurveyComponent {
  displayStyle = "none";
  surverMSG = 'Create Survey';
  displayedColumns = ['sn', 'name', 'year', 'duration', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  viewData: any = [];
  createSurveyForm: any = FormGroup;
  isSubmitted: boolean = false;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  isShowButton: boolean = true;
  createdById: any;
  startMinDate: Date = new Date();
  endMinDate: Date;
  isVisible: boolean = false;
  msg: string;
  isShowPopup: boolean = false;
  isShowMapQuestion: boolean = false;
  isShowAssignSurvey: boolean = false;
  isShowCloneSurvey: boolean = false;
  dataEntryLevelArr: any = [];
  selectYearArr: any = [];
  removeId: any;
  selectedDataEntry: any;
  selectedApproval: any;
  selectedViewer: any;
  selectedReviewer: any
  selectedYear: any;
  editItem;
  viewerLevelArrID: any = [];
  selectedViewData: any = [];
  msgFromChild: any = [];
  cloneSurveyArr: any = [];
  approvalRoleID: any = [];
  approvalRoleArr: any = []
  reviewerRoleArr: any = [];
  reviewerRoleID: any;
  viewerRoleArr: any = []
  viewerRoleID: any = [];
  dataEntryRoleArr: any = [];
  dataEntryRoleID: any = [];
  approvalStatus: number = 0;
  isDateValue: boolean = false;
  reviewerLevelArrID: any = []
  updateByID: number;
  // regxVal = /^[ A-Za-z0-9_.@-]*$/
  //regxVal = /^[ A-Za-z0-9_.\|,\-\/]*$/
  regxVal = /^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};':"\\|,.<>\/?]*$/;
  viewButtonModal: boolean = false;
  assignSurveyId: string = '';
  mapQuestionId: string = '';
  isLoading: boolean = true;
  public scroll = Common.scroll;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'Manage Survey', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey List', current: true }
    ]
  }
  searchValue: string = ''
  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  printDataSource: any;
  pdfOpen: boolean = false;
  public config = Common.config;
  isGenerating: boolean = false
  yearCode: any;
  notifyTbdData: any;
  modalText: string = "Are you sure you want to Notify Tpd this Survey?"
  modalProcedureText: string = "Are you sure you want to run the procedure?"
  modelHeadingText: string = "Notify TPD";
  modelProcedureHeadingText: string = "Run Store Procedure";
  isShowNotifiedTpdPopup: boolean = false;
  isNotifyTpd: boolean = false;
  resultPopup: any = []
  dataUniqueArray: any = [];
  domainObjectArray: any;
  resultData: any;
  type: string = ''
  selectedQues: any = [];
  heading: any = []
  isShowViewSurvey:boolean = false;
  surveyId:any;
  showProcedurePopup:boolean = false;
  constructor(
    private dataservice: DataService,
    private formBuillder: FormBuilder,
    private datePipe: DatePipe,
    private cdref: ChangeDetectorRef,
    public print: NgxPrintElementService,
    private _ExcelService: ExcelService,
    private toast: ToastService,
    private surveyDataEntryService: SurveyDataEntryService
  ) {
    this.createSurveyForm = this.formBuillder.group({
      surveyname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      description: new FormControl('', [Validators.required, Validators.pattern(this.regxVal), Validators.minLength(3), Validators.maxLength(500)]),
      dataEntry: new FormControl(null, [Validators.required]),
      dataEntryRole: new FormControl(null, [Validators.required]),
      approvalLevel: new FormControl(null, [Validators.required]),
      approvalRole: new FormControl(null, [Validators.required]),
      year: new FormControl(null, [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      reviewerlevel: new FormControl(null, [Validators.required]),
      reviewerRole: new FormControl(null, [Validators.required]),
      viewerlevel: new FormControl(null, [Validators.required]),
      viewerRole: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      procedureName: new FormControl(null),

    })
    this.createSurveyForm.controls['endDate'].disable()
    this.createSurveyForm.controls['status'].setValue(this.default);
    this.createdById = (sessionStorage.getItem("userId"));

    this.createSurveyForm.valueChanges.subscribe(res => {
      if (this.createSurveyForm.controls['startDate'].value && this.createSurveyForm.controls['endDate'].disabled) {
        this.createSurveyForm.controls['endDate'].enable()
        this.endMinDate = new Date(res.startDate);
      }
    });

  }


  ngOnInit() {
    this.toast.dismissSnackBar();
    this.yearCode = 'all';
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };


    this.viewSurveyReport('page', this.payLoadsViewUser);
    this.viewAllSelectionData();
  }


  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    this.viewSurveyReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.viewSurveyReport('page', this.payLoadsViewUser);
  }

  filterData(type: string) {

    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    type == 'clear' ? this.searchValue = '' : ''

    this.viewSurveyReport('page', payloads);
  }

  getFinancialYear(data) {
    console.log('data',data)
    this.yearCode = data == "All" ? 'ALL' : data,
      this.pageNumber = 0;
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.viewSurveyReport('page', this.payLoadsViewUser);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
    };
    this.viewSurveyReport('type', payloads);
  }

  dateChange() {
    this.createSurveyForm.get('endDate')?.setValue('');
    if (this.createSurveyForm.controls['startDate'].value) {
      this.endMinDate = new Date(this.createSurveyForm.controls['startDate'].value);
    }
  }

  viewSurveyReport(type: string, paylodas: any) {
    type == 'page'
      ? ((
        this.dataSource = new MatTableDataSource<any>()
      ),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];

    paylodas['search'] = this.searchValue
        console.log('this.yearCode', this.yearCode)
    let request: any = {
      "id": null,
      yearcode: (this.yearCode || this.yearCode == 'ALL') ? this.yearCode : Common.setFinanacialYear(),
    }

    this.dataservice.viewSurvey(paylodas, request).subscribe(
      (res: any) => {
        let resJSON = res;
        if (resJSON?.success) {
          let dataSource = resJSON?.result?.result;
          this.printDataSource = structuredClone(dataSource);

          this.viewData = resJSON?.result?.result?.[0];
          if (type === 'page') {
            this.dataSource = new MatTableDataSource<any>(dataSource),
              // this.dataSource.paginator = this.viewtable;
              this.dataSource.sort = this.sort;
            (this.isLoading = false),
              (this.totalCount = resJSON?.result?.totalElements);
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
              'Description',
              'Year',
              'Active Duration',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);

            itemData.forEach((element: any) => {
              element['Survey Name'] = element['surveyName'];
              element['Description'] = element['surveyDescription'];
              element['Year'] = element['yearCode'];
              element['Active Duration'] = new Date(element?.surveyStartDate).toLocaleDateString("en-US") + ' to ' + new Date(element?.surveyEndDate).toLocaleDateString("en-US");
              element['Status'] = element['status'] ? 'Active' : 'Inactive';
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'create survey',
                headers
              );
              this.isGenerating = false
            }, 500);
          }
        } else {
          this.isLoading = false;
          this.isGenerating = false
        }
      },
      (error) => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.isGenerating = false;
        // this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
  }

  // viewSurveyReport() {
  //   let data:any = {
  //     "id":null
  //   }
  //   this.isLoading = true;
  //   this.dataSource = new MatTableDataSource<any>([]);
  //   this.dataSource.paginator = this.viewtable;
  //   this.dataSource.sort = this.sort;
  //   this.dataservice.viewSurvey(data).subscribe(res => {
  //     let resSTR = JSON.stringify(res);
  //     let resJSON = JSON.parse(resSTR);
  //     if (resJSON.success == true) {
  //       this.viewData = resJSON?.result
  //       this.dataSource = new MatTableDataSource<any>(this.viewData);
  //       this.dataSource.paginator = this.viewtable;
  //       this.dataSource.sort = this.sort;
  //       this.cdref.detectChanges();
  //     }
  //     this.isLoading = false;
  //   }, (error) => {
  //     this.isLoading = false;
  //     this.isSubmitted = false;

  //     let message = 'Something went wrong!'
  //     this.showAlert(message);
  //   })
  // }

  viewAllSelectionData() {
    this.selectYearArr = []
    let obj = {
      "isDropDown": null
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      resJSON?.result?.forEach(element => {
        if (element?.status == 1 && element?.is_active_user == 1) {
          this.dataEntryLevelArr.push(element)
        }

      });
    }, (error) => {
      this.isSubmitted = false
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
    this.dataservice.viewYear().subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      resJSON?.result.forEach(element => {
        this.selectYearArr.push(element)
      }, (error) => {
        this.isSubmitted = false
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      });
    })
  }


  //****************************************ApprovalLevel section***************************************

  approvalLevel(selectedItem, isEdit?: boolean) {
    if (!isEdit) {
      this.createSurveyForm.controls['approvalRole'].reset()
    }
    this.approvalRoleArr = [];
    this.selectedApproval = selectedItem;

    this.dataEntryLevelArr.forEach((element, i) => {
      if (selectedItem?.level_name == element?.level_name || selectedItem?.levelName == element?.level_name) {
        if (selectedItem?.parent_level_id == element?.parent_level_id || selectedItem?.parentLevelId == element?.parent_level_id) {
          let roleIds = element?.role_ids.split(",");
          let roleNames = element?.role_ids_name.split(",");
          roleIds.map((role: any, i: number) => {
            this.approvalRoleArr.push({
              'id': element?.id,
              "role_ids": role,
              "name": element?.level_name + ' - ' + roleNames[i]
            })
          });
        }
      }
    });
  }
  approvalRole(selectedItem) {
    this.approvalRoleID = selectedItem
  }

  //****************************************ReviewerLevel section***************************************

  reviewerLevel(selectedItem, event?: any) {
    let reviewerArr: any = []
    this.selectedReviewer = []
    let str_Arr: any = []
    let newArr: any = []
    if (selectedItem.length > 0) {
      reviewerArr = this.createSurveyForm?.value.reviewerRole
      //this.reviewerRoleArr = []   
      //let id = selectedItem
      // this.createSurveyForm.controls['reviewerRole'].reset() 
      selectedItem.forEach(item => {
        //str_Arr.push(...item?.role_ids.split(','));    // remove reviewer level and remove reviewer role 
        str_Arr.push(item?.id);
        this.selectedReviewer.push(item?.id);
        this.dataEntryLevelArr.forEach((element, i) => {
          if (item?.level_name == element?.level_name || item?.levelName == element?.level_name) {
            if (item?.parent_level_id == element?.parent_level_id || item?.parentLevelId == element?.parent_level_id) {
              let roleIds = element?.role_ids.split(",");
              let roleNames = element?.role_ids_name.split(",");
              roleIds.map((role: any, i: number) => {
                if (this.reviewerRoleArr.filter((item: any) => { return item.name == (element?.level_name + ' - ' + roleNames[i]) }).length == 0) {
                  this.reviewerRoleArr.push({
                    'id': element?.id,
                    "role_ids": role,
                    "name": element?.level_name + ' - ' + roleNames[i]
                  })
                }
              });
            }
          }
        });
      });

      if (event && event == 'change') {
        //This function is used to update the role array
        let reviewerRoleSelectedData = this.createSurveyForm?.value.reviewerRole;
        let reviewdString: any = []
        let reviewdArray: any = []
        selectedItem.map((reData: any) => {
          let isStringIncluded = reviewerRoleSelectedData?.filter((str: any) => {
            if (typeof str == "string") {
              return str?.includes(reData?.level_name)
            } else {
              if (str?.name?.includes(reData?.level_name)) {
                return str?.name
              }
            }
          });
          
          if (isStringIncluded?.length > 0) {
            reviewdString.push(...isStringIncluded)
          }
          let isarrayIncluded = this.reviewerRoleArr?.filter((str: any) => {
            if (str?.name?.includes(reData?.level_name)) {
              return str?.name
            }
          });
          if (isarrayIncluded?.length > 0) {
            reviewdArray.push(...isarrayIncluded)
          }
        })
        this.createSurveyForm.patchValue({ reviewerRole: reviewdString });
        if (reviewdArray?.length > 0) {
          this.reviewerRoleArr = reviewdArray;
        }
      }
    }
    else {
      this.reviewerRoleArr = [];
      this.createSurveyForm.controls['reviewerRole'].reset()
    }
  }

  deleteItems(data: any, action: string) {
    if (action == 'reviewer') {
      // let itemValue = this.createSurveyForm?.value.reviewerRole
      // let updatedVal = itemValue?.filter((res: any) => res?.id != data?.id)
      // this.createSurveyForm.patchValue({ reviewerRole: updatedVal });
      this.removeByAttr(this.reviewerRoleArr, "id", data?.id)
    } else {
      this.removeByAttr(this.viewerRoleArr, "id", data?.id)
    }
  }

  removeByAttr(arr: any, attr: any, value: any) {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && arr[i].hasOwnProperty(attr)
        && (arguments.length > 2 && arr[i][attr] === value)) {

        arr.splice(i, 1);

      }
    }
    return arr;
  }

  showTitle(item: any, action: string) {
    let title: any = []
    if (action == 'reviewerlevel') {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.level_name)
      });
    } else if (action == 'viewerlevel') {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.level_name)
      });
    }
    else if (action == 'reviewerrole') {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.name)
      });
    }
    else {
      item.slice(1, item.length)?.forEach((element) => {
        title.push(element?.name)
      });
    }

    return title.join('\n')
  }

  reviewerRole(selectedItem) {
    var reviewerRole: any = [];
    selectedItem.forEach(element => {
      let selectedRow = `${element?.id}||${element?.role_ids}`;
      reviewerRole.push(selectedRow);
    });
    this.reviewerRoleID = reviewerRole.join(',');
  }


  //****************************************ViewerLevel section***************************************
  viewerLevel(selectedItem, event?: any) {
    this.selectedViewer = []
    //this.viewerRoleArr = []
    let str_Arr: any = []
    let viewerArr: any = []
    let newArr: any = []

    if (selectedItem.length > 0) {
      viewerArr = this.createSurveyForm?.value.viewerRole
      // this.createSurveyForm.controls['viewerRole'].reset()
      selectedItem.forEach(item => {
        //str_Arr.push(...item?.role_ids.split(','));    // remove viewer level and remove viewer role 
        str_Arr.push(item?.id);
        this.selectedViewer.push(item?.id);
        this.dataEntryLevelArr.forEach((element, i) => {
          if (item?.level_name == element?.level_name || item?.levelName == element?.level_name) {
            if (item?.parent_level_id == element?.parent_level_id || item?.parentLevelId == element?.parent_level_id) {
              let roleIds = element?.role_ids.split(",");
              let roleNames = element?.role_ids_name.split(",");
              roleIds.map((role: any, i: number) => {
                if (this.viewerRoleArr.filter((item: any) => { return item.name == (element?.level_name + ' - ' + roleNames[i]) }).length == 0) {
                  this.viewerRoleArr.push({
                    'id': element?.id,
                    "role_ids": role,
                    "name": element?.level_name + ' - ' + roleNames[i]
                  })
                }
              });
            }
          }
        });
      });
      if (event && event == 'change') {
        //This function is used to update the role array
        let viewerRoleSelectedData = this.createSurveyForm?.value.viewerRole;
        let viewerString: any = []
        let viewedArray: any = []
        selectedItem?.map((reData: any) => {
          let isStringIncluded = viewerRoleSelectedData?.filter((str: any) => {
            if (typeof str == "string") {
              return str?.includes(reData?.level_name)
            } else {
              if (str?.name?.includes(reData?.level_name)) {
                return str?.name
              }
            }
          });
          if (isStringIncluded?.length > 0) {
            viewerString.push(...isStringIncluded)
          }
          let isarrayIncluded = this.viewerRoleArr?.filter((str: any) => {
            if (str?.name?.includes(reData?.level_name)) {
              return str?.name
            }
          });
          if (isarrayIncluded?.length > 0) {
            viewedArray.push(...isarrayIncluded)
          }
        })
        this.createSurveyForm.patchValue({ viewerRole: viewerString });
        if (viewedArray.length > 0) {
          this.viewerRoleArr = viewedArray;
        }
      }
    }
    else {
      this.viewerRoleArr = []
      this.createSurveyForm.controls['viewerRole'].reset()
    }
  }

  viewerRole(selectedItem) {
    var viewerRole: any = [];
    selectedItem.forEach(element => {
      let selectedRow = `${element?.id}||${element?.role_ids}`;
      viewerRole.push(selectedRow);
    });
    this.viewerRoleID = viewerRole.join(',');
  }
  //****************************************Data Entery Level section***************************************
  dataEntryLevel(selectedItem, isEdit?: boolean) {
    if (!isEdit) {
      this.createSurveyForm.controls['dataEntryRole'].reset()
    }
    this.dataEntryRoleArr = []
    this.selectedDataEntry = selectedItem;
    this.dataEntryLevelArr.forEach((element, i) => {
      if (selectedItem?.level_name == element?.level_name || selectedItem?.levelName == element?.level_name) {
        if (selectedItem?.parent_level_id == element?.parent_level_id || selectedItem?.parentLevelId == element?.parent_level_id) {
          let roleIds = element?.role_ids.split(",");
          let roleNames = element?.role_ids_name.split(",");
          roleIds.map((role: any, i: number) => {
            this.dataEntryRoleArr.push({
              'id': element?.id,
              "role_ids": role,
              "name": element?.level_name + ' - ' + roleNames[i]
            })
          });
        }
      }
    });
  }
  dataEntryRole(selectedItem) {
    this.dataEntryRoleID = selectedItem
  }
  //****************************************Data Entery Level end***************************************

  approvalSelected(event) {
    if (event.target.checked) {
      this.approvalStatus = 1
    } else {
      this.approvalStatus = 0
    }
  }

  selectYear(selectedItem) {
    this.selectedYear = selectedItem;
  }

  onSubmit(action) {
    this.isSubmitted = true
    if (this.createSurveyForm.invalid) {
      return
    }
    else {
      var statusValue, message
      if (this.createSurveyForm.value.status == 'Active') {
        statusValue = 1
      } else {
        statusValue = 0
      }
      let description = this.createSurveyForm.value.description.replace(/(<([^>]+)>)/ig, "").trim();
      let data = {
        "yearCode": this.selectedYear?.yearCode,
        "surveyName": this.createSurveyForm.value.surveyname.trim(),
        "description": description,
        "startDate": this.datePipe.transform(this.createSurveyForm.value.startDate, 'dd-MM-yyyy'),
        "endDate": this.datePipe.transform(this.createSurveyForm.value.endDate, 'dd-MM-yyyy'),
        "approverLevelId": this.selectedApproval?.id,
        "approverRoleId": this.approvalRoleID?.role_ids,
        "reviewerLevelId": this.selectedReviewer.join(','),
        "reviewerRoleId": this.reviewerRoleID,
        "viewerLevelId": this.selectedViewer.join(','),
        "viewerRoleId": this.viewerRoleID,
        "deoLevelId": this.selectedDataEntry?.id,
        "deoRoleId": this.dataEntryRoleID?.role_ids,
        "reviewMandatory": this.approvalStatus,
        "status": statusValue,
        "loggedInUserId": parseInt(this.createdById),
        "procedureName":this.createSurveyForm?.value?.procedureName ? this.createSurveyForm?.value?.procedureName.trim() : null
      }

      if (action == 'save') {
        this.dataservice.createSurvey(data).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false;
          if (resJSON.success == true) {
            this.toast.showMessage('You have successfully saved the data', '', 'success');
            let payloads = {
              pageNo: 0,
              sortOrder: 'desc',
              search: '',
            };
            this.viewSurveyReport('page', payloads);

            this.createSurveyForm.reset()
            this.approvalStatus = 0
            this.createSurveyForm.controls['status'].setValue(this.default);
            this.dataEntryRoleArr = [];
            this.viewerRoleArr = [];
            this.reviewerRoleArr = [];
            this.approvalRoleArr = [];
            this.cdref.detectChanges();
            this.startMinDate = new Date();
          }
          else {
            this.isSubmitted = false
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');

          }
        }, (error) => {
          this.isSubmitted = false
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        })
      }
      if (action == 'update') {
        data['id'] = this.editItem?.id
        this.dataservice.updateSurvey(data).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false
          if (resJSON.success == true) {
            this.isShowButton = true;

            this.surverMSG = 'Create Survey';
            this.toast.showMessage('You have successfully updated the data', '', 'success');
            let payloads = {
              pageNo: 0,
              sortOrder: 'desc',
              search: '',
            };
            this.viewSurveyReport('page', payloads);
            this.createSurveyForm.reset()
            this.approvalStatus = 0
            this.createSurveyForm.controls['status'].setValue(this.default);
            this.dataEntryRoleArr = [];
            this.viewerRoleArr = [];
            this.reviewerRoleArr = [];
            this.approvalRoleArr = [];
            this.cdref.detectChanges();
            this.startMinDate = new Date();
            this.endMinDate = new Date();
            this.createSurveyForm.controls['endDate'].disable()

          } else {
            this.isShowButton = false
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          }
        }, (error) => {
          this.isSubmitted = false
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        })
      }

    }
  }

  onCancle() {
    this.isSubmitted = false
    this.isDateValue = false
    this.surverMSG = 'Create Survey';
    this.isShowButton = true;
    this.approvalStatus = 0
    this.createSurveyForm.reset();
    this.createSurveyForm.controls['status'].setValue(this.default);
    this.startMinDate = new Date();
    this.endMinDate = new Date();
    this.createSurveyForm.controls['endDate'].disable();
  }

  mapchildArr: any = []
  mapQuestion(data) {
    this.mapchildArr = []
    this.mapQuestionId = data?.id;
    this.mapchildArr.push(data)
    this.isShowMapQuestion = true
    this.isShowAssignSurvey = false;
    this.isShowCloneSurvey = false;
  }

  cloneSurvey(data) {
    this.isShowMapQuestion = false;
    this.isShowAssignSurvey = false;
    this.isShowCloneSurvey = true;
    this.cloneSurveyArr = data;
    this.cloneSurveyArr = [];
    this.cloneSurveyArr.push(data);
  }

  assignSurvey(data) {
    this.isNotifyTpd = false;
    this.assignSurveyId = data?.id;
    this.msgFromChild = []
    this.msgFromChild.push(data);
    this.isShowMapQuestion = false
    this.isShowAssignSurvey = true;
    this.isShowCloneSurvey = false;
  }

  notifyTpd(data: any) {
    this.isNotifyTpd = true;
    this.assignSurveyId = data?.id;
    this.msgFromChild = []
    this.msgFromChild.push(data);
    this.isShowMapQuestion = false
    this.isShowAssignSurvey = true;
    this.isShowCloneSurvey = false;
    // let element = {
    //   "surveyId": data?.id,
    //   "loginId": parseInt(this.createdById),
    // }
    // this.notifyTbdData = data;
    // this.isShowNotifiedTpdPopup = true;
  }

  viewSurvey(data) {
    this.assignSurveyId = data?.id;
    this.msgFromChild = []
    this.msgFromChild.push(data);
    this.isShowMapQuestion = false
    this.isShowAssignSurvey = false;
    this.isShowCloneSurvey = false;
    this.isShowViewSurvey = true;
  }

  closePopup() {
    this.displayStyle = "none";
  }

  notifyTPDSurvey(event: boolean) {
    if (event) {
      let data = {
        "surveyId": this.notifyTbdData?.surveyId,
        "loginId": parseInt(this.createdById),
      }
      this.dataservice.notifyTPDSurvey(data).subscribe((res: any) => {
        if (res.success == true) {
          this.isShowNotifiedTpdPopup = false;
          this.viewSurveyReport('page', this.payLoadsViewUser);
          this.toast.showMessage(res?.message, '', 'success');
        }
        else {
          this.isShowNotifiedTpdPopup = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isShowNotifiedTpdPopup = false;
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isShowNotifiedTpdPopup = false;
    }
  }

  edit(selectedItem) {
    this.isDateValue = true
    this.surverMSG = 'Edit Survey'
    this.editItem = selectedItem;
    let focus, statusValue, viewerLevelArr: any = [], reviewerLevelArr: any = [], reviewerRoleArr: any = [], viewerRoleArr: any = []
    this.viewerLevelArrID = [];
    this.reviewerLevelArrID = []

    this.isShowButton = false;

    if (selectedItem.status == 0) {
      statusValue = 'Inactive'
    } else {
      statusValue = 'Active'
    }

    //****************************************ReviewerLevel section update***************************************

    var reviewerRole: any = [];
    this.reviewerRoleID = []
    var viewerRole: any = [];
    this.viewerRoleID = [];
    selectedItem?.reviewerLevelId.forEach(element => {
      reviewerLevelArr.push(element?.levelName)
      this.reviewerLevelArrID.push(element?.id)
    });

    Object.keys(selectedItem?.reviewerRole).forEach(element => {
      selectedItem?.reviewerRole[element].forEach(item => {
        reviewerRoleArr.push(element + ' - ' + item?.name);

        selectedItem?.reviewerLevelId.forEach(data => {
          if (element == data?.levelName) {
            let selectedRow = `${data?.id}||${item?.id}`;
            reviewerRole.push(selectedRow);
          }
          this.reviewerRoleID = reviewerRole.join(',');
        });
      });
    });

    //****************************************ViewerLevel section update***************************************
    selectedItem?.viewerLevelId.forEach(element => {
      viewerLevelArr.push(element?.levelName)
      this.viewerLevelArrID.push(element?.id)
    });

    Object.keys(selectedItem?.viewerRole).forEach(element => {
      selectedItem?.viewerRole[element].forEach(item => {
        viewerRoleArr.push(element + ' - ' + item?.name)

        selectedItem?.viewerLevelId.forEach(data => {
          if (element == data?.levelName) {
            let selectedRow = `${data?.id}||${item?.id}`;
            viewerRole.push(selectedRow);
          }
          this.viewerRoleID = viewerRole.join(',');
        });
      });
    });

    // this.approvalLevel(selectedItem?.approverLevelId, true);
    // this.reviewerLevel(selectedItem?.reviewerLevelId);
    // this.viewerLevel(selectedItem?.viewerLevelId);
    // this.dataEntryLevel(selectedItem?.deoLevelId);

    if (new Date(selectedItem?.surveyStartDate) < new Date()) {
      this.startMinDate = new Date(selectedItem?.surveyStartDate)
    } else {
      this.startMinDate = new Date();
    }

    this.endMinDate = new Date(selectedItem?.surveyStartDate);
    this.viewerRoleArr = [];
    this.reviewerRoleArr = [];
    setTimeout(() => {
      this.createSurveyForm.patchValue({
        'surveyname': selectedItem?.surveyName,
        'description': selectedItem?.surveyDescription,
        'year': selectedItem?.yearCode,
        "startDate": new Date(selectedItem?.surveyStartDate),
        "endDate": new Date(selectedItem?.surveyEndDate),
        'approvalLevel': selectedItem?.approverLevelId?.levelName,
        'reviewerlevel': reviewerLevelArr,
        'viewerlevel': viewerLevelArr,
        'dataEntry': selectedItem?.deoLevelId?.levelName,
        'approvalRole': selectedItem?.approverLevelId?.levelName + ' - ' + selectedItem?.approverRoleId?.name,
        'reviewerRole': reviewerRoleArr,
        'viewerRole': viewerRoleArr,
        'dataEntryRole': selectedItem?.deoLevelId?.levelName + ' - ' + selectedItem?.deoRoleId?.name,
        'status': statusValue,
        'procedureName':selectedItem?.procedureName
      });
      this.approvalLevel(selectedItem?.approverLevelId, true);
      this.reviewerLevel(selectedItem?.reviewerLevelId);
      this.viewerLevel(selectedItem?.viewerLevelId);
      this.dataEntryLevel(selectedItem?.deoLevelId, true);
    }, 500)

    focus = document.getElementById('focusForm')
    focus.scrollIntoView();

    this.selectedYear = selectedItem
    this.approvalRoleID['role_ids'] = selectedItem?.approverRoleId?.id;
    this.dataEntryRoleID['role_ids'] = selectedItem?.deoRoleId?.id;
    this.approvalStatus = selectedItem?.reviewMandatory
    this.selectedDataEntry = selectedItem?.deoLevelId
    this.selectedApproval = selectedItem?.approverLevelId
    this.selectedReviewer = this.reviewerLevelArrID
    this.selectedViewer = this.viewerLevelArrID
  }

  remove(selectedItem) {
    this.isShowPopup = true
    this.removeId = selectedItem
  }

  removeRecord(item) {
    if (item) {
      let obj = {
        "id": this.removeId?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataservice.deleteSurvey(obj).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success == true) {
          this.isShowPopup = false
          let payloads = {
            pageNo: 0,
            sortOrder: 'desc',
            search: '',
          };
          this.viewSurveyReport('page', payloads);
          this.createSurveyForm.reset();
        } else {
          this.isSubmitted = false
          this.isShowPopup = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isSubmitted = false
        // let message = 'Something went wrong!'
        // this.showAlert(message)
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      })
    }
    else {
      this.isShowPopup = false
    }
  }


  callProcedureConfirmation(selectedItem) {
    this.showProcedurePopup = true
    this.surveyId = selectedItem
  }

  callProcedureApi(item) {
    if (item) {
      let obj = {
        "surveyId": this.surveyId?.id,
      }
      this.dataservice.surveyProcedureCall(obj).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success == true) {
          this.showProcedurePopup = false;
          this.toast.showMessage(resJSON?.message, '', 'success');
          let payloads = {
            pageNo: 0,
            sortOrder: 'desc',
            search: '',
          };
          this.viewSurveyReport('page', payloads);
          this.createSurveyForm.reset();
        } else {
          this.showProcedurePopup = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.showProcedurePopup = false;
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      })
    }
    else {
      this.showProcedurePopup = false
    }
  }

  view(selectedItem) {
    // this.getSurveyById(selectedItem);
    this.viewQuesSubques();
    this.assignSurveyId = selectedItem?.id
    this.selectedViewData = []
    this.selectedViewData?.push(selectedItem)
    this.viewButtonModal = true;
    this.displayStyle = "block";
  }

  closeViewModal() {
    this.viewButtonModal = false;
    this.displayStyle = "none";
  }

  viewQuesSubques() {
    let data = {
      id: this.viewData.id
    }
    this.selectedQues = [];
    this.surveyDataEntryService.getQuestionSubquestion(data).subscribe((res: any) => {
      if (res?.success) {
        this.selectedQues = res?.result
        this.selectedQues?.map((x: any) => {
          if (!this.heading?.some(item => (item?.domainName == x?.domain?.domainName + (x?.subDomain ? '-' + x?.subDomain?.subDomainName : '')))) {
            this.heading.push({
              domainName: x?.domain?.domainName + (x?.subDomain ? '-' + x?.subDomain?.subDomainName : '')
            })
          }
        })

        this.heading.forEach((element, index) => {
          let ques: any = []
          this.selectedQues.forEach((a: any) => {
            if (element?.domainName == a?.domain?.domainName + (a?.subDomain ? '-' + a?.subDomain?.subDomainName : '')) {
              ques.push(a?.question)
            } this.heading[index]['question'] = ques
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

  backButtonClick() {
    this.toast.dismissSnackBar();
    this.createSurveyForm.reset();
    this.createSurveyForm.controls['status'].setValue(this.default);
    this.isShowButton = true;
    this.searchValue = "";
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      // yearCode: this.yearCode = null,
      yearCode: this.yearCode = 'All',
      search: "",
    };
    this.viewSurveyReport('page', payloads);
  }

  getSurveyById(element: any) {
    this.toast.dismissSnackBar()
    let data = {
      surveyId: element?.id,
      isThird: 0,
      loginId: parseInt(this.createdById),
      instanceId: element?.instanceId
    };

    this.isLoading = true
    this.surveyDataEntryService.getDataListById(data).subscribe(
      (res: any) => {
        let allItemsId: any = [];
        if (res?.[0]) {
          this.resultData = res?.[0];
          this.resultData['result_head'][0]['inst_id'] = element?.instanceId
          this.resultPopup = this.resultData?.result_det

          //this.payLoads = res

          let uniqueQuestionDomainid = [
            ...new Set(
              res?.[0]?.result_det.map(
                (item) => { return { 'domain': item.domain_id, 'subDomain': item.sub_domain_id } }
              )
            ),
          ];

          const arrayUniqueByKey = [...new Map(uniqueQuestionDomainid.map((item: any) =>
            [item['subDomain'], item])).values()];

          this.domainObjectArray = arrayUniqueByKey



          this.dataUniqueArray = [
            ...new Set(
              res?.[0]?.result_det.map(
                (item) => item.domain_id && item.sub_domain_id
              )
            ),
          ];


          // this.dataUniqueArrayWithoutSubQuestion = [
          //   ...new Set(res?.[0]?.result_det.map((item) => item.domain_id)),
          // ];

          // this.subDomainArry = [
          //   ...new Set(
          //     res?.[0]?.result_det.map((item) => item.sub_domain_id)
          //   ),
          // ];
          //Filtered Subdomain
          res?.[0]?.result_det.forEach((domSub: any) => {
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

          this.isLoading = false
          this.type == 'submit' ? (this.isShowPopup = true, this.type = '') : ''

        } else {

          this.isLoading = false
          this.type == 'submit' ? (this.isShowPopup = false, this.type = '') : ''
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false
        this.type == 'submit' ? (this.isShowPopup = false, this.type = '') : ''
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
  }


}






