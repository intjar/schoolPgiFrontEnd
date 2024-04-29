import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { CreateSurveyComponent } from '../create-survey/create-survey.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'clone-survey',
  templateUrl: './clone-survey.component.html',
  styleUrls: ['./clone-survey.component.scss']
})
export class CloneSurveyComponent {

  displayStyle = "none";
  createdById: any;
  @Input() cloneSurveyArr: any = []
  public config = Common.config;
  pdfOpen: boolean = false;
  isGenerating: boolean = false;
  cloneSurveyAlldata: any
  cloneSurveyForm: FormGroup;
  isSubmitted: boolean = false;
  selectYearArr: any = [];
  dataEntryLevelArr: any = [];
  isVisible: boolean = false;
  selectedYear: any;
  startMinDate: Date = new Date();
  endMinDate: Date;
  approvalRoleArr: any = []
  selectedApproval: any;
  approvalRoleID: any = [];
  isShowCreateSurvey: boolean = false;
  selectedReviewer: any;
  reviewerRoleArr: any = [];
  reviewerRoleID: any;
  selectedViewer: any;
  viewerRoleArr: any = []
  viewerRoleID: any = [];
  selectedDataEntry: any;
  dataEntryRoleArr: any = [];
  dataEntryRoleID: any = [];
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  isShowPopup: boolean = false;
  removeDataId: any;
  reviewerLevelArrID: any = [];
  viewerLevelArrID: any = [];
  questionArr: any = [];
  subQuestionArr: any = [];
  isSurveyNameChange: boolean = false;
  isSurveyYearChange: boolean = false;
  displayedColumns = ['sn', 'domain', 'subDomain', 'question', 'subquestions', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  isLoading: boolean = true;
  regxVal = /^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};':"\\|,.<>\/?]*$/;
  breadcrums = {
    heading: 'Manage Survey', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey List' },
      { link: 'Clone Survey', current: true }
    ]
  }
  public scroll = Common.scroll;
  timer: number = Common.timeout;
  @Output() backClick: any = new EventEmitter();
  totalCount: number = 0
  pageNumber: number = 0
  searchValue: string = ''
  constructor(
    private router: Router,
    private dataservice: DataService,
    private formBuillder: FormBuilder,
    private datePipe: DatePipe,
    private toast: ToastService,
    public print: NgxPrintElementService, private _ExcelService: ExcelService) {
    this.createdById = (sessionStorage.getItem("userId"));
    this.cloneSurveyForm = this.formBuillder.group({
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

    this.cloneSurveyForm.controls['status'].setValue(this.default);
    this.cloneSurveyForm.controls['endDate'].disable()

    this.cloneSurveyForm.valueChanges.subscribe(res => {
      if (this.cloneSurveyForm.controls['startDate'].value && this.cloneSurveyForm.controls['endDate'].disabled) {
        this.cloneSurveyForm.controls['endDate'].enable()
        this.endMinDate = new Date(res.startDate);
      }
    });

  }


  ngOnInit() {
    this.toast.dismissSnackBar();
    this.viewTableData();

    let payloads = this.payLoadsViewQuestion()
    this.viewmapQuest('page', payloads)

    this.AllValuesetFromCreateSurvey();
  }

  backToSurvey() {
    this.backClick.emit(true)
  }
  reviewerRoleData: any = []
  AllValuesetFromCreateSurvey() {
    // this.focus = document.getElementById('focusForm')
    // this.focus.scrollIntoView();

    //****************************************ReviewerLevel section update***************************************
    var reviewerRole: any = [];
    this.reviewerRoleID = []
    var viewerRole: any = [];
    this.viewerRoleID = [];
    this.reviewerRoleData = []
    let statusValue, viewerLevelArr: any = [], reviewerLevelArr: any = [], viewerRoleArr: any = []
    // if (this.cloneSurveyArr[0].status == 1) {
    //   statusValue = 'Active'
    // } else {
    //   statusValue = 'Inactive'
    // }

    statusValue = 'Active'

    this.cloneSurveyArr[0]?.reviewerLevelId.forEach(element => {
      reviewerLevelArr.push(element?.levelName)
      this.reviewerLevelArrID.push(element?.id)
    });

    Object.keys(this.cloneSurveyArr[0]?.reviewerRole).forEach(element => {
      this.cloneSurveyArr[0]?.reviewerRole[element].forEach(item => {
        this.reviewerRoleData.push(element + ' - ' + item.name);

        this.cloneSurveyArr[0]?.reviewerLevelId.forEach(data => {
          if (element == data?.levelName) {
            let selectedRow = `${data.id}||${item?.id}`;
            reviewerRole.push(selectedRow);
          }
          this.reviewerRoleID = reviewerRole.join(',');
        });
      });
    });

    //****************************************ViewerLevel section update***************************************
    this.cloneSurveyArr[0]?.viewerLevelId.forEach(element => {
      viewerLevelArr.push(element?.levelName)
      this.viewerLevelArrID.push(element?.id)
    });

    Object.keys(this.cloneSurveyArr[0]?.viewerRole).forEach(element => {
      this.cloneSurveyArr[0]?.viewerRole[element].forEach(item => {
        viewerRoleArr.push(element + ' - ' + item?.name)

        this.cloneSurveyArr[0]?.viewerLevelId.forEach(data => {
          if (element == data?.levelName) {
            let selectedRow = `${data?.id}||${item?.id}`;
            viewerRole.push(selectedRow);
          }
          this.viewerRoleID = viewerRole.join(',');
        });
      });
    });
    
    this.viewerRoleArr = [];
    this.reviewerRoleArr = [];
    // Below code - Need to change the logic for data calling
    setTimeout(() => {
      this.cloneSurveyForm.patchValue({
        'surveyname': this.cloneSurveyArr[0]?.surveyName.replace(/ {2,}/g, ' ').trim(),
        'description': this.cloneSurveyArr[0]?.surveyDescription,
        'year': this.cloneSurveyArr[0]?.yearCode,
        "startDate": new Date(this.cloneSurveyArr[0]?.surveyStartDate),
        "endDate": new Date(this.cloneSurveyArr[0]?.surveyEndDate),
        'approvalLevel': this.cloneSurveyArr[0]?.approverLevelId?.levelName,
        'reviewerlevel': reviewerLevelArr,
        'viewerlevel': viewerLevelArr,
        'dataEntry': this.cloneSurveyArr[0]?.deoLevelId?.levelName,
        'approvalRole': this.cloneSurveyArr[0]?.approverLevelId?.levelName + ' - ' + this.cloneSurveyArr[0]?.approverRoleId?.name,
        'reviewerRole': this.reviewerRoleData,
        'viewerRole': viewerRoleArr,
        'dataEntryRole': this.cloneSurveyArr[0]?.deoLevelId?.levelName + ' - ' + this.cloneSurveyArr[0]?.deoRoleId?.name,
        'status': statusValue,
        'procedureName':this.cloneSurveyArr[0]?.procedureName
      })
      this.approvalLevel(this.cloneSurveyArr[0]?.approverLevelId, true);
      this.reviewerLevel(this.cloneSurveyArr[0]?.reviewerLevelId);
      this.viewerLevel(this.cloneSurveyArr[0]?.viewerLevelId);
      this.dataEntryLevel(this.cloneSurveyArr[0]?.deoLevelId);
    }, 500);


    this.defaultValue = structuredClone(this.cloneSurveyForm.value);
    if (new Date(this.cloneSurveyArr[0]?.surveyStartDate) > new Date()) {
      this.startMinDate = new Date()
    } else {
      this.startMinDate = new Date(this.cloneSurveyArr[0]?.surveyStartDate);
    }

    this.reviewMandatory = this.cloneSurveyArr[0]?.reviewMandatory
    this.selectedYear = this.cloneSurveyArr[0],
      this.approvalRoleID['role_ids'] = this.cloneSurveyArr[0]?.approverRoleId?.id;
    this.dataEntryRoleID['role_ids'] = this.cloneSurveyArr[0]?.deoRoleId?.id;
    this.selectedDataEntry = this.cloneSurveyArr[0]?.deoLevelId
    this.selectedApproval = this.cloneSurveyArr[0]?.approverLevelId
    this.selectedReviewer = this.reviewerLevelArrID
    this.selectedViewer = this.viewerLevelArrID;
  }
  viewTableData() {
    let message
    this.isLoading = true;
    let obj = {
      "isDropDown": null
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe((res: any) => {
      if (res?.status) {
        res?.result.forEach(element => {
          this.dataEntryLevelArr.push(element)
        });
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }

    }, (error) => {
      this.isLoading = false;
      this.isSubmitted = false
      this.toast.showMessage('Something went wrong!', '', 'unsuccess');
    })
    this.dataservice.viewYear().subscribe((res: any) => {
      if (res?.success) {
        res?.result.forEach(element => {
          this.selectYearArr.push(element)
        })
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    }, (error) => {
      this.isSubmitted = false
      this.isLoading = false;
      this.toast.showMessage('Something went wrong!', '', 'unsuccess');
    })

  }

  viewmapQuest(type: string, payLoads: any) {
    let data = {
      "id": parseInt(this.cloneSurveyArr[0]?.id)
    }
    let message = ''
    // Api Changed
    this.dataservice.viewmapQuestion(payLoads, data).subscribe((res: any) => {
      let resSTR = JSON.stringify(res);
      let resJSON = res


      if (resJSON?.success) {
        // this.dataSource = new MatTableDataSource<any>(resJSON?.result);
        this.totalCount = res?.totalElements
        // this.dataSource.sort = this.sort;
        this.isLoading = false;

        this.cloneSurveyAlldata = structuredClone(resJSON?.result)
        if (type === 'page') {
          this.dataSource = new MatTableDataSource<any>(resJSON?.result);
          (this.isLoading = false),
            (this.totalCount = res?.totalElements);
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
            'Domain',
            'Sub Domain',
            'Question',
            'Status',
          ];
          let responseData = structuredClone(this.cloneSurveyAlldata);
          responseData.forEach((element: any) => {
            element['Domain'] = element?.domainName;
            element['Sub Domain'] = element?.subDomainName;
            element['Question'] = element?.question;
            element['Status'] = element?.isDeleted == 0 ? 'Active' : 'Inactive';
          });

          setTimeout(() => {
            this._ExcelService.downloadFile(responseData, 'map_Question_master', headers);
            this.isGenerating = false;
          }, 1000);

        }
      }
      else {
        this.isLoading = false;
        this.isSubmitted = false
        this.dataSource = new MatTableDataSource<any>();
        // this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
      }


    }, (error) => {
      this.isLoading = false;
      this.dataSource = new MatTableDataSource<any>();
      this.isSubmitted = false
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }



  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    this.viewmapQuest(type, payLoads);
  }

  filterData(type: string) {
    let payloads = this.payLoadsViewQuestion()
    payloads['pageNo'] = 0
    this.viewmapQuest('page', payloads)
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    let payloads = this.payLoadsViewQuestion()
    this.viewmapQuest('page', payloads)
  }





  dateChange() {
    this.cloneSurveyForm.get('endDate')?.setValue('');
    if (this.cloneSurveyForm.controls['startDate'].value) {
      this.endMinDate = new Date(this.cloneSurveyForm.controls['startDate'].value);
    }
  }

  selectYear(selectedItem) {
    this.selectedYear = selectedItem;
  }

  payLoadsViewQuestion() {
    return {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase() ? this.searchValue.toLowerCase() : '',
    };
  }

  //****************************************ApprovalLevel section***************************************


  approvalLevel(selectedItem, isEdit?: boolean) {
    if (!isEdit) {
      this.cloneSurveyForm.controls['approvalRole'].reset()
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
    this.selectedReviewer = [];
    let str_Arr: any = [];
    let reviewerArr: any = [];
    if (selectedItem.length > 0) {
      reviewerArr = this.cloneSurveyForm?.value.reviewerRole;
      selectedItem.forEach(item => {
        str_Arr.push(item?.id)
        this.selectedReviewer.push(item?.id);
        this.dataEntryLevelArr.forEach((element, i) => {
          if (item?.level_name == element?.level_name || item?.levelName == element?.level_name) {
            if (item?.parent_level_id == element?.parent_level_id || item?.parentLevelId == element?.parent_level_id) {

              let roleIds = element?.role_ids.split(",");
              let roleNames = element?.role_ids_name.split(",");
              roleIds.map((role: any, i: number) => {
                let filterReviewerData = this.reviewerRoleArr.filter((item: any) => {
                  return item?.name == ((element?.level_name ? element?.level_name : element?.levelName) + ' - ' + roleNames[i])
                })
                if (filterReviewerData.length == 0) {
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
        let reviewerRoleSelectedData = this.cloneSurveyForm?.value?.reviewerRole;
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
        this.cloneSurveyForm.patchValue({ reviewerRole: reviewdString });
        if (reviewdArray?.length > 0) {
          this.reviewerRoleArr = reviewdArray;
        }
      }
    } else {
      this.reviewerRoleArr = []
      this.cloneSurveyForm.controls['reviewerRole'].reset()
    }
  }

  deleteItems(data: any, action: string) {
    if (action == 'reviewer') {
      this.removeByAttr(this.reviewerRoleArr, 'id', data?.id);
    } else {
      this.removeByAttr(this.viewerRoleArr, 'id', data?.id);
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
    // this.viewerRoleArr = []

    let str_Arr: any = []
    let viewerArr: any = []
    let newArr: any = []

    if (selectedItem?.length > 0) {
      viewerArr = this.cloneSurveyForm?.value?.viewerRole
      selectedItem?.forEach(item => {
        str_Arr.push(item?.id)
        this.selectedViewer.push(item?.id);
        this.dataEntryLevelArr.forEach((element, i) => {
          if (item?.level_name == element?.level_name || item?.levelName == element?.level_name) {
            if (item?.parent_level_id == element?.parent_level_id || item?.parentLevelId == element?.parent_level_id) {
              let roleIds = element?.role_ids.split(",");
              let roleNames = element?.role_ids_name.split(",");
              roleIds.map((role: any, i: number) => {
                let filterViewerData = this.viewerRoleArr.filter((item: any) => {
                  return item?.name == ((element?.level_name ? element?.level_name : element?.levelName) + ' - ' + roleNames[i])
                })
                if (filterViewerData.length == 0) {
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
        let viewerRoleSelectedData = this.cloneSurveyForm?.value?.viewerRole;
        let viewerString: any = []
        let viewedArray: any = []
        selectedItem.map((reData: any) => {
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
        this.cloneSurveyForm.patchValue({ viewerRole: viewerString });

        if (viewedArray?.length > 0) {
          this.viewerRoleArr = viewedArray;
        }
      }
    } else {
      this.viewerRoleArr = []
      this.cloneSurveyForm.controls['viewerRole'].reset();
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
  dataEntryLevel(selectedItem, event?: any) {
    this.selectedDataEntry = selectedItem;
    if (event && event == 'change') {
      this.dataEntryRoleArr = []
      this.cloneSurveyForm.controls['dataEntryRole'].reset()
    }
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
  reviewMandatory: number = 0;
  approvalSelected(event) {
    if (event.target.checked) {
      this.reviewMandatory = 1
    } else {
      this.reviewMandatory = 0
    }
  }
  //******************************************** Clone and Save *************************************************
  //****************************************************************************************************************
  defaultValue: any;
  hasChange: boolean = false;

  onSubmit() {
    let statusValue, message, cloneandsaveArr: any = [], count = 0;
    const formValue: any = [];
    var parsedValue: any = []
    this.isSubmitted = true
    if (this.cloneSurveyForm.invalid) {
      return
    }
    else {

      //******************************** Check form last change ***********************************
      // **********************************************************************************************

      Object.keys(this.cloneSurveyForm.controls).map((key) => {
        parsedValue = {
          [key]: (this.cloneSurveyForm.get(key) as FormControl).value,
          changed: (this.cloneSurveyForm.get(key) as FormControl).dirty
        }
        formValue.push(parsedValue)
      })
      formValue.forEach(element => {
        if (this.defaultValue?.surveyname == element?.surveyname) {
          count += 1
        }
        if (this.defaultValue?.year == element?.year) {
          count += 1
        }
      });
      if (count == 2) {
        this.toast.showMessage('Plese change survey name or select year!', '', 'success');
        return
      }
      if (this.cloneSurveyForm.value.status == 'Active') {
        statusValue = 1
      } else {
        statusValue = 0
      }
      this.dataSource.data.map(element => {
        cloneandsaveArr.push({
          'domainMaster': {
            "id": element?.domainId
          },
          'subDomain': {
            "id": element?.subDomainId
          },
          'questionMaster': {
            "id": element?.questionId
          },
          'subQuestionIds': element?.subQuestionIds,
          'valueLogic': element?.valueLogic,
          'pointerLogic': element?.pointerLogic,
          'weightage': element?.weightage,
          'isMandatory': element?.isMandatory,
          'isThirdParty': element?.isThirdParty,
          'dataSource': {
            "id": element?.dataSourceId,
          },
          "isDeleted": element?.isDeleted,
        })
      });

      let data = {
        surveyMaster: {
          "id": this.cloneSurveyArr[0]?.id,
          "yearCode": this.selectedYear.yearCode,
          "surveyName": this.cloneSurveyForm.value.surveyname.replace(/ {2,}/g, ' ').trim(),
          "description": this.cloneSurveyForm.value.description.replace(/ {2,}/g, ' ').trim(),
          "startDate": this.datePipe.transform(this.cloneSurveyForm.value.startDate, 'dd-MM-yyyy'),
          "endDate": this.datePipe.transform(this.cloneSurveyForm.value.endDate, 'dd-MM-yyyy'),
          "approverLevelId": this.selectedApproval?.id,
          "approverRoleId": this.approvalRoleID?.role_ids,
          "reviewerLevelId": this.selectedReviewer.join(','),
          "reviewerRoleId": this.reviewerRoleID,
          "viewerLevelId": this.selectedViewer.join(','),
          "viewerRoleId": this.viewerRoleID,
          "deoLevelId": this.selectedDataEntry?.id,
          "deoRoleId": this.dataEntryRoleID?.role_ids,
          "status": statusValue,
          "assignedSurveyStatus": this.cloneSurveyArr[0]?.assignedSurveyStatus,
          "reviewMandatory": this.reviewMandatory,
          "loggedInUserId": parseInt(this.createdById),
          "procedureName": this.cloneSurveyForm?.value?.procedureName ? this.cloneSurveyForm?.value?.procedureName.trim() : null
        },
        mapQuestion: cloneandsaveArr
      }
      this.dataservice.cloneAndSaveSurvey(data).subscribe((res: any) => {
        // let resSTR = JSON.stringify(res);
        // let resJSON = JSON.parse(resSTR);
        this.isSubmitted = false;
        if (res.success) {
          this.reviewMandatory = 0
          this.toast.showMessage('You have successfully saved the data', '', 'success');
          this.cloneSurveyForm.controls['status'].setValue(this.default);
          this.isShowCreateSurvey = true;
          if (new Date(this.cloneSurveyArr[0]?.surveyStartDate) > new Date()) {
            this.startMinDate = new Date()
          } else {
            this.startMinDate = new Date(this.cloneSurveyArr[0]?.surveyStartDate);
          }
        }
        else {
          this.isSubmitted = false
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      }, (error) => {
        this.isSubmitted = false
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      })
    }

  }

  onCancle() {
    this.isSubmitted = false
    let focus
    this.cloneSurveyForm.reset();
    this.cloneSurveyForm.controls['status'].setValue(this.default);
    //this.startMinDate = new Date();
    this.cloneSurveyForm.controls['endDate'].disable()
    // focus = document.getElementById('focusForm')
    // focus.scrollIntoView();
    this.startMinDate = new Date();
    this.endMinDate = new Date();
    // if(new Date(this.cloneSurveyArr[0]?.surveyStartDate) > new Date()){
    //   this.startMinDate = new Date();
    //   this.endMinDate = new Date();
    // }else{
    //   this.startMinDate = new Date(this.cloneSurveyArr[0]?.surveyStartDate);
    //   this.endMinDate = new Date(this.cloneSurveyArr[0]?.surveyStartDate);
    // }
  }

  //******************************************** Clone View Sub Question*************************************************
  //**********************************************************************************************************************
  subQuestion(item) {
    let message
    this.subQuestionArr = [];
    let obj = {
      "surveyId": this.cloneSurveyArr[0]?.id,
      "domainId": item?.domainId,
      "subDomainId": item?.subDomainId == null ? 0 : item?.subDomainId,
      "questionId": item?.questionId
    }
    this.dataservice.ViewSurveyMapSubQuestionByQuestId(obj).subscribe((res: any) => {
      if (res.success) {
        this.subQuestionArr = res?.result
      }
      else {
        // this.toast.showMessage(res?.errorMessage, '', 'unsuccess'); 
      }
    }, (error) => {
      this.isSubmitted = false
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  closePopup() {
    this.displayStyle = "none";
  }


  deleteItem(selectedItem) {
    this.isShowPopup = true
    this.removeDataId = selectedItem
  }
  removeRecord(item) {
    if (item) {
      this.isShowPopup = false
      this.dataSource.data = this.dataSource.data.filter(i => i !== this.removeDataId)
        .map((i, idx) => (i.position = (idx + 1), i));
    }

    else {
      this.isShowPopup = false
    }
  }

}
