import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { CreateSurveyComponent } from '../create-survey/create-survey.component';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle} from '@angular/cdk/drag-drop';
import {MatTable} from '@angular/material/table';
@Component({
  selector: 'map-question',
  templateUrl: './map-question.component.html',
  styleUrls: ['./map-question.component.scss']
})
export class MapQuestionComponent implements OnInit {
  displayedColumns = ['sn', 'domain', 'subDomain', 'question', 'subQuestion', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('table') table: MatTable<any>;
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  mapquestionForm: FormGroup;
  mapQuestionArr: any = [];
  domainArr: any = [];
  domainID: any;
  subDomainArr: any = [];
  subDomainID: any;
  questionArr: any = [];
  questionID: any;
  subQuestionArr: any = [];
  // subQuestionID: any;
  dataSourceArr: any = [];
  dataSourceID: any;
  createdById: any;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  isVisible: boolean = false;
  msg: string
  removeID: any;
  isShowPopup: boolean = false;
  isSubmitted: boolean = false;
  isShowError: boolean = false;
  isshowButton: boolean = true;
  checkbox: boolean = false;
  checked: any;
  isLoading: boolean = true;
  // showSubQ: boolean = false;
  IDSubquestion: any;
  subquestions: any = [];
  isShowfield: boolean = false;
  sQuestionArr: any = []
  qID: any
  IDQuestion: any;
  surveyMaster: any;
  IDSUbdomain: any;
  isSubDoman: boolean
  sDomainArr: any = []
  // dID;
  IDdomain: any;
  displayStyle = "none";
  IDDataSOurce: any;
  subdomain: any = []
  subQues: any = []
  selectSubQuestionArr: any = [];
  showdataSource: boolean = false
  editItem: any;
  mandatoryChecked: number = 0;
  thirdPartyChecked: number = 0;
  regxVal = /^[0-9]*(\.|,)?[0-9]*$/
  // regxVal = ^[0-9]+(\.[0-9]{1,2})?$/
  regxValue = /^[ A-Za-z0-9_.\|,\-\/]*$/
  dragDisabled = true;
  breadcrums = {
    heading: 'Manage Survey', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey List' },
      { link: 'Map Question', current: true }
    ]
  }
  @Output() backClick: any = new EventEmitter();
  @Input() mapQuestionId: string = '';
  public scroll = Common.scroll;
  public config = Common.config;
  timer: number = Common.timeout;
  questiontype: any;
  mandatory: any;
  thirdParty: any;
  questionRecord: any = []
  totalCount: number = 0
  pageNumber: number = 0
  searchValue: string = '';
  pdfOpen: boolean = false;
  isGenerating: boolean = false;
  mapQuestionAlldata: any;
  subQuestErrorMSG: string
  mapMSG = "Map Question";
  subQuestionObj: any = []
  isViewClick: boolean = false;
  mapQuestionSurveyArr: any = [];
  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private create: CreateSurveyComponent,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService
  ) {
    this.mapquestionForm = this.formBuilder.group({
      domainName: new FormControl(null, [Validators.required]),
      subdomainName: new FormControl(null, [Validators.required]),
      question: new FormControl(null, [Validators.required]),
      subQuestion: new FormControl(null, [Validators.required]),
      valueLogic: new FormControl('', [ Validators.maxLength(100), Validators.pattern(this.regxValue)]),
      pointerLogic: new FormControl('', [ Validators.maxLength(100), Validators.pattern(this.regxValue)]),
      weightage: new FormControl('', [Validators.required, Validators.pattern(this.regxVal)]),
      datasourceName: new FormControl(null, [Validators.required]),
      status: new FormControl('', [Validators.required]),
      mandatory: new FormControl(''),
      thirdParty: new FormControl(''),
      serialno: new FormControl(null, [Validators.required]),
    })
    this.createdById = (sessionStorage.getItem("userId"));
    this.mapquestionForm.controls['status'].setValue(this.default);
  }


  closePopup() {
    this.displayStyle = "none";
  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.mapQuestionArr = this.create?.mapchildArr
    let payloads = this.payLoadsViewQuestion()
    this.viewmapQuest('page', payloads)
    this.mapquestionForm.controls['subQuestion'].disable();
    this.mapquestionForm.controls['subdomainName'].disable();
    this.mapQuestionSurveyData()
  }

  mapQuestionSurveyData() {
    let data: any = {
      "id": this.mapQuestionId
    }
    let payLoadsViewUser = {
      pageNo: 0,
      sortOrder: '',
      search: '',
    };

    this.isLoading = true;
    this.dataService.viewSurvey(payLoadsViewUser, data).subscribe((res: any) => {     
      if (res?.success) {       
        this.mapQuestionSurveyArr = res?.result?.result;         
        
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
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

  popupReviewerRole(data: any) {
    let reviewerRole: any = [];
    Object.keys(data).forEach(element => {
      data[element].forEach(item => {
        reviewerRole.push(element + ' - ' + item?.name);
      });
    });
    return reviewerRole.join(',');
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



  payLoadsViewQuestion() {
    return {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase() ? this.searchValue.toLowerCase() : '',
    };
  }



  backToSurvey() {
    this.backClick.emit(true)
  }

  onselectDomain(val) {
    let flag = 0
    this.mapquestionForm.patchValue({
      subdomainName: null
    })
    this.sDomainArr = []
    this.IDdomain = val?.id
    this.domainID = val?.domainName;
    // this.dID = val?.id;
    this.subDomainArr = []
    this.dataService.addManageSubDomainViewLevel().subscribe((res) => {
      this.subdomain = res;
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      resJSON?.result.forEach(element => {
        if (element?.status == true) {
          this.subDomainArr?.push(element)
        }
      });
      this.subDomainArr.forEach(element => {
        if (element?.domainMaster?.id == val?.id) {
          flag = 1
          this.sDomainArr.push(element);
          this.mapquestionForm.controls['subdomainName'].enable();
        }
      });
      if (flag != 1) {
        this.mapquestionForm.controls['subdomainName'].disable();
        // let data = {
        //   subDomainName: "NA",
        //   id: 0
        // }
        // this.sDomainArr.push(data)
      }
    })
  }

  onselectsubDomain(val) {
    // this.showSubQ = false;
    this.isSubDoman = true
    this.IDSUbdomain = val?.id
    this.subDomainID = val?.subDomainName;
  }

  onselectQuestion(val) {
    this.isShowError = false;
    this.isSubmitted = false
    this.subQuestErrorMSG = ''
    this.mapquestionForm.patchValue({
      subQuestion: null
    })
    this.IDQuestion = val?.id;
    this.questionID = val?.question;
    this.qID = val?.id
    this.sQuestionArr = []
    if (val?.questionTypeMaster?.answerType != "Add Sub Question") {
      this.mapquestionForm.controls['subQuestion'].disable();
      let data = {
        subQuestion: "NA",
        id: null
      }
      this.sQuestionArr.push(data)
    } else {
      this.subQuestionArr.forEach(element => {
        if (element?.questionMaster?.id == val?.id) {
          this.sQuestionArr.push(element)
          this.mapquestionForm.controls['subQuestion'].enable();
        }
      });
      if (val?.questionTypeMaster?.answerType == "Add Sub Question") {
        if (this.sQuestionArr == '') {
          this.isShowError = true;
          this.mapquestionForm.controls['subQuestion'].enable();
        }

      }

    }
    // if (val?.questionTypeMaster?.answerType == "File Upload"  ) {
    //   this.isShowfield = true;
    //   this.thirdPartyChecked = 1
    // } else {
    //   this.isShowfield = false;
    // }
    this.subQuestionArr = []
    this.dataService?.viewSubQuestion().subscribe((res) => {
      this.subQues = res
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR)
      resJSON?.result.forEach(element => {
        if (element?.status == true) {
          this.subQuestionArr?.push(element)
        }

      });
    })

    // if(val?.questionTypeMaster?.answerType == "File Upload"){
    //   this.thirdPartyChecked = 0
    // this.mapquestionForm.patchValue({
    //   datasourceName :null
    // })
    // }
  }

  onselectsubQuestion(val) {
    // let item
    // this.IDSubquestion = val?.id
    // this.subQuestionID = val?.subQuestion;  
    this.subquestions = []
    val?.forEach(element => {
      this.subquestions.push(element?.id)
    });
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    let payloads = this.payLoadsViewQuestion()
    this.viewmapQuest('page', payloads)
  }

  showTitle(item: any) {
    let title: string[] = []
    item.slice(1, item.length)?.forEach((element) => {
      title.push(element?.subQuestionCode + '-' + element?.subQuestion)
    });
    return title.join('\n')
  }

  onSelectDataSource(val) {
    this.IDDataSOurce = val?.id
  }

  viewDetails() {
    this.dataSourceArr = []
    // Domain
    this.domainArr = []
    this.questionArr = []
    this.dataService.addManageDomainViewLevel().subscribe((res: any) => {
      if (res?.success == true) {
        res?.result.forEach(element => {
          if (element?.status == true) {
            this.domainArr.push(element)
          }
        });
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })

    //Sub Domain
    this.dataService.addManageSubDomainViewLevel().subscribe((res: any) => {
      this.subdomain = res;
      if (res?.success == true) {
        res?.result.forEach(element => {
          if (element?.status == true) {
            this.subDomainArr?.push(element)
          }
        });
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isSubmitted = false
      this.isShowError = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
    let obj = {
      "surveyId": null,
      "domainId": null,
      "subDomainId": null
    }

    // Question
    this.dataService.viewQuestion(obj).subscribe((res: any) => {

      if (res?.success == true) {
        this.questiontype = res?.result;
        // res?.result.forEach(element => {
        //   if (element?.status == true) {
        //     this.questionArr?.push(element)
        //   }
        // });

        // ************************ remove question from drop down  after create map question *************************

        if (this.questionRecord?.length > 0) {
          res?.result.forEach(element => {
            let flag = false
            this.questionRecord.forEach(item => {
              if ((item?.questionCode == element?.questionCode) && element?.status) {
                flag = true
              }
            })
            if (!flag) {
              this.questionArr.push(element)
            }
          });


          this.questionArr = this.questionArr.filter((c, index) => {     // remove duplicate data
            return this.questionArr.indexOf(c) === index;
          });
        }
        else {
          this.questionArr = res?.result
        }


      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isSubmitted = false
      this.isShowError = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })

    // Sub Question
    this.dataService?.viewSubQuestion().subscribe((res: any) => {
      this.subQues = res
      this.subQuestionArr = []
      if (res?.success == true) {
        res?.result.forEach(element => {
          if (element?.status == true) {
            this.subQuestionArr?.push(element)
          }
        });
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isSubmitted = false
      this.isShowError = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })

    //Data Source
    this.dataService.addDataSourceViewLevel().subscribe((res: any) => {
      if (res?.success == true) {
        res?.result.forEach(element => {
          if (element?.status == true) {
            this.dataSourceArr?.push(element)
          }
        });
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isSubmitted = false
      this.isShowError = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }


  viewmapQuest(type: string, payLoads: any) {
    this.isLoading = true;
    let data = {
      "id": parseInt(this.mapQuestionArr[0].id)
    }


    this.dataService.viewmapQuestion(payLoads, data).subscribe((res: any) => {
      if (res?.success) {
        let dataSource = res?.result;     
        this.questionRecord = res?.result
        this.totalCount = res?.totalElements
        this.viewDetails();
        this.isLoading = false;

        this.mapQuestionAlldata = structuredClone(dataSource)
        if (type === 'page') {
          this.dataSource = new MatTableDataSource<any>(dataSource);
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
          let responseData = structuredClone(this.mapQuestionAlldata);
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
      } else {
        // this.showAlert(res?.errorMessage)
        this.viewDetails();
        this.dataSource = new MatTableDataSource<any>();
        this.isLoading = false;
      }
    }, (error) => {
      this.isSubmitted = false;
      this.isShowError = false;
      this.isLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  dropTable(event: CdkDragDrop<any>) {
    this.dragDisabled = true;
    const prevIndex = this.questionRecord.findIndex((d) => d === event.item.data);   
    moveItemInArray(this.questionRecord, prevIndex, event.currentIndex);  
    this.table.renderRows();
    //console.log('this.questionRecord..', this.questionRecord)
    //this.dataService.viewmapQuestion(payLoads, data).subscribe((res: any) => {})
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
  viewSubQuest(data) {
    this.isLoading = true;
    let item = {
      "surveyId": data?.surveyId,
      "domainId": data?.domainId,
      "subDomainId": data?.subDomainId == null ? 0 : data?.subDomainId,
      "questionId": data?.questionId
    }
    this.dataService?.ViewSurveyMapSubQuestionByQuestId(item).subscribe((res: any) => {
      if (res?.success) {
        this.selectSubQuestionArr = res?.result;
        this.isLoading = false;
      }
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }


  view(selectItem) {
    this.selectSubQuestionArr = []
    this.selectSubQuestionArr.push(selectItem)
  }

  onSubmit(action) {
    let message
    this.isSubmitted = true;
    if (this.isShowError) {
      this.isSubmitted = false;
      this.subQuestErrorMSG = 'Please Add Sub-Question for selected Question.'

    }

    if (this.mapquestionForm.invalid) {
      return
    }
    else {
      var deleteStatus
      if (this.mapquestionForm.value.status == 'Active') {
        deleteStatus = 0
      } else {
        deleteStatus = 1
      }

      this.mapquestionForm.value.mandatory == true ? this.mandatory = 1 : this.mandatory = 0
      this.mapquestionForm.value.thirdParty == true ? this.thirdParty = 1 : this.thirdParty = 0

      let data = {
        "surveyMaster": { "id": parseInt(this.mapQuestionArr[0].id) },
        "domainMaster": { "id": this.IDdomain },
        "subDomain": { "id": this.IDSUbdomain },
        "questionMaster": { "id": this.IDQuestion },
        "subQuestionIds": this.subquestions?.join(','),
        "valueLogic": this.mapquestionForm.value.valueLogic,
        "pointerLogic": this.mapquestionForm.value.pointerLogic,
        "weightage": this.mapquestionForm.value.weightage,
        "isMandatory": this.mandatory,
        "isThirdParty": this.thirdParty,
        "dataSource": { "id": this.IDDataSOurce },
        "isDeleted": deleteStatus,       
        "sno": this.mapquestionForm.value.serialno,       
        "createdBy": parseInt(this.createdById)
      }

      if (action == 'save') {
        this.dataService.createmapQuestion(data)?.subscribe((res: any) => {
          this.isSubmitted = false;
          this.isShowError = false;
          if (res?.success == true) {
            this.sDomainArr = []
            this.sQuestionArr = []
            this.subquestions = [];
            this.IDSUbdomain = undefined
            this.toast.showMessage('You have successfully saved the data', '', 'success');
            let payloads = this.payLoadsViewQuestion()
            this.viewmapQuest('page', payloads)
            this.mapquestionForm.reset()
            this.mapquestionForm.controls['status'].setValue(this.default);
            this.showdataSource = false;
            this.mapquestionForm.controls['subQuestion'].disable();
            this.mapquestionForm.controls['subdomainName'].disable();
            //*********** romove question from drop down after save map question ********
            this.questionArr = this.questionArr.filter(item => {
              return item.id !== this.IDQuestion
            })
          } else {
            this.isSubmitted = false
            this.isShowError = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }

        }, (error) => {
          this.isSubmitted = false
          this.isShowError = false;
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        })
      }

      if (action == 'update') {
        data['id'] = this.editItem?.id
        this.dataService.updateMapQuestion(data)?.subscribe((res: any) => {
          this.isSubmitted = false;
          this.isShowError = false;
          if (res?.success == true) {
            this.sDomainArr = []
            this.sQuestionArr = []
            this.subquestions = [];
            this.IDSUbdomain = undefined
            this.isshowButton = true;
            this.toast.showMessage('You have successfully updated the data', '', 'success');
            let payloads = this.payLoadsViewQuestion()
            this.viewmapQuest('page', payloads)
            this.mapquestionForm.reset()
            this.mapquestionForm.controls['status'].setValue(this.default);
            this.showdataSource = false;
            this.mapquestionForm.controls['subQuestion'].disable();
            this.mapquestionForm.controls['subdomainName'].disable();
          } else {
            this.isshowButton = false;
            this.isSubmitted = false;
            this.isShowError = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }

        }, (error) => {
          this.isSubmitted = false
          this.isShowError = false;
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        })
      }
    }
  }

  isMandatory(event) {
    if (event.target.checked) {
      this.mandatoryChecked = 1
    } else {
      this.mandatoryChecked = 0
    }
  }

  isthirdparty(event) {
    if (event.target.checked) {
      // this.showdataSource = true
      this.thirdPartyChecked = 1
    } else {
      // this.showdataSource = false
      this.thirdPartyChecked = 0
    }
  }

  edit(selectItem: any, button: any) {
    if (button == 'edit') {
      this.mapMSG = "Edit Map Question"
      this.isViewClick = false;
      this.mapquestionForm.enable()
    } else {
      this.mapMSG = "View Map Question"
      this.isViewClick = true;
      this.mapquestionForm.disable();

    }
    this.sDomainArr = [];
    this.sQuestionArr = [];
    this.subQuestionObj = []
    this.subquestions = [];
    this.IDSUbdomain = undefined
    this.isSubDoman = true;
    this.mandatory = selectItem?.isMandatory
    this.thirdParty = selectItem?.isThirdParty
    this.IDDataSOurce = selectItem?.dataSourceId
    let flag = 0;
    this.editItem = selectItem;
    let focus, deleteStatus,  // patchSubQues: any = []
      SQId: any = [],
      SQArrey: string[] = [],
      SQcode: any = []
    selectItem?.subQuestionIds?.split(',').map((sData: any) => {
      this.subquestions.push(sData);
    })

    this.isshowButton = false;
    selectItem?.isDeleted == 0 ? deleteStatus = 'Active' : deleteStatus = 'Inactive';
    selectItem?.isMandatory == 1 ? this.mandatoryChecked = 1 : this.mandatoryChecked = 0;
    selectItem?.isThirdParty == 1 ? this.thirdPartyChecked = 1 : this.thirdPartyChecked = 0;
    // this.showdataSource = true;
    // if (this.questiontype?.questionTypeMaster?.answerType == 'File Upload') {
    //   this.showdataSource = true;
    // }

    // if(this.thirdPartyChecked == 1){
    //   this.showdataSource = true
    // }else{
    //   this.showdataSource = false
    // }
    // if (selectItem?.subDomainName == null) {
    //   let item = {
    //     subDomainName: "NA",
    //     id: 0
    //   }
    //   this.sDomainArr.push(item)
    //   this.mapquestionForm.controls['subdomainName'].disable();
    // } else {

    this.subdomain?.result.forEach(element => {
      if (element?.domainMaster?.id == selectItem?.domainId) {
        this.sDomainArr.push(element)
        flag = 1
        this.mapquestionForm.controls['subdomainName'].enable();
      } else if (this.isViewClick) {
        this.mapquestionForm.controls['subdomainName'].disable();
      }
    });

    //}
    if (flag != 1) {
      this.mapquestionForm.controls['subdomainName'].disable();
    }
    // if (selectItem?.subQuestionName == '') {
    //   let item = {
    //     subQuestion: "NA",
    //     id: 0
    //   }
    //   this.sQuestionArr.push(item)
    // }
    // else {
    if (selectItem?.questionTypeMaster?.answerType != "Add Sub Question") {
      this.mapquestionForm.controls['subQuestion'].disable();
      this.subQues?.result.forEach(element => {
        if (element?.questionMaster?.id == selectItem?.questionId) {
          this.sQuestionArr.push(element)
          this.mapquestionForm.controls['subQuestion'].enable();
        }
        else if (this.isViewClick) {
          this.mapquestionForm.controls['subQuestion'].disable();
        }
      });
    }
    //}

    // if (selectItem?.questionType == "File Upload") {
    //   this.isShowfield = true;
    // } else {
    //   this.isShowfield = false;
    // }


    // selectItem?.subQuestionName.forEach(item => {
    //   this.sQuestionArr.forEach(element => {
    //     if (item == element?.subQuestion) {
    //       SQArrey.push(item)
    //     }
    //   });
    // });
    // selectItem?.subQuestionCode.forEach(item => {
    //   this.sQuestionArr.forEach(element => {
    //     if (item == element?.subQuestionCode) {
    //       SQcode.push(item)
    //     }
    //   });
    // });
    // for (let i = 0; i < SQcode.length; i++) {
    //   this.subQuestionObj.push({
    //     id: Number(this.subquestions[i]),        
    //     subQuestion: SQArrey[i],
    //     subQuestionCode: SQcode[i],       
    //   })
    // }
    this.sQuestionArr.filter((item: any) => {
      selectItem?.subQuestionName.forEach(element => {
        if (item.subQuestion == element) {
          this.subQuestionObj.push(item)
        }
      })
    })
    let selectedSubdomain = this.sDomainArr.filter((item: any) => { return item.subDomainName == selectItem.subDomainName })
   setTimeout(() => {
    this.mapquestionForm.patchValue({
      "domainName": selectItem?.domainName,
      "subdomainName": selectedSubdomain[0],
      "question": selectItem?.questionCode + '-' + selectItem?.question,
      "subQuestion": selectItem?.subQuestionName == '' ? this.sQuestionArr : this.subQuestionObj,
      "valueLogic": selectItem?.valueLogic,
      "pointerLogic": selectItem?.pointerLogic,
      "weightage": selectItem?.weightage,
      "mandatory": this.mandatoryChecked,
      "thirdParty": this.thirdPartyChecked,
      "datasourceName": selectItem?.dataSourceName,
      "status": deleteStatus,
      "serialno": selectItem?.sno
    })
   },200)
    

    focus = document.getElementById('focusForm')
    focus.scrollIntoView();

    this.IDdomain = selectItem?.domainId;
    this.IDSUbdomain = selectItem?.subDomainId == null ? 0 : selectItem?.subDomainId
    this.IDQuestion = selectItem?.questionId;
    this.IDDataSOurce = selectItem?.dataSourceId;
    // this.IDSubquestion = selectItem?.subQuestionName;
  }

  onCancel() {
    this.showdataSource = false;
    this.isSubmitted = false;
    this.isViewClick = false;
    this.isShowError = false;
    this.isshowButton = true;
    this.mapquestionForm.reset();
    this.mapquestionForm.enable();
    this.mapquestionForm.controls['status'].setValue(this.default);
    this.sQuestionArr = []
    this.sDomainArr = []
    this.subquestions = [];
    this.IDSUbdomain = undefined;
    this.mapquestionForm.controls['subdomainName'].disable();
    this.mapquestionForm.controls['subQuestion'].disable();
  }

  remove(selectItem) {
    this.isShowPopup = true;
    this.removeID = selectItem;
  }

  removeRecord(item) {
    if (item) {
      let data = {
        "id": this.removeID?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataService.deleteMapQuestion(data).subscribe((res) => {
        let resSTR = JSON.stringify(res)
        let resJSON = JSON.parse(resSTR)
        if (resJSON?.success == true) {
          this.isShowPopup = false
          this.onCancel();
          let payloads = this.payLoadsViewQuestion()
          this.viewmapQuest('page', payloads)
        } else {
          this.isShowPopup = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isSubmitted = false;
        // this.isShowError = false;       
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      })
    } else {
      this.isShowPopup = false
    }
  }

}
