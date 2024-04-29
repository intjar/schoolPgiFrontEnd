import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
// import { Subject } from 'rxjs';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from '@angular/material/sort';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ExcelService } from 'src/app/services/excel.service';
import { MasterSettingService } from 'src/app/services/master-setting.service';
import { ToastService } from 'src/app/services/toast';
declare var $;
@Component({
  selector: 'app-question-master',
  templateUrl: './question-master.component.html',
  styleUrls: ['./question-master.component.scss']
})
export class QuestionMasterComponent {

  displayedColumns = ['sn', 'question', 'type', 'questionCode', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('viewtable') set viewtable(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (!this.dataSource.sort) {
      this.dataSource.sort = sort;
    }
  }
  @ViewChild(MatSort) sortSub: MatSort;
  SubdisplayedColumns = ['sn', 'question', 'subQuestion', 'type', 'subQuestionCode', 'status', 'action'];
  dataSourceSubQuestion = new MatTableDataSource<any>();
  @ViewChild('viewsubtable') set viewsubtable(value: MatPaginator) {
    this.dataSourceSubQuestion.paginator = value;
  }

  @ViewChild(MatSort) sort: MatSort;

  isSubquestion: boolean = false;
  viewQuestionArr: any = [];
  questionTypeArr: any = [];
  questionForm: any = FormGroup;
  subQuestionForm: any = FormGroup;
  isSubmitted: boolean = false;
  isSubmittedSubQue: boolean = false;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  isShowButton: boolean = true;
  isShowSubButton: boolean = true;
  questionTypeID
  updatedId: any = 0;
  isVisible: boolean = false;
  msg: string;
  questionMSG = 'Add Question';
  subQuestionMSG = 'Add Sub Question'
  displayStyle = "none";
  removequestionID;

  isShowOption: boolean = false;
  isShowCheckbox: boolean = false;
  isShowSubQuestion: boolean = false;
  createdById;
  selectQusetionID
  isDeleteQuestion: boolean = true;
  isShowPopup: boolean = false;
  isConfirmPopup: boolean = false;
  openChangeQuestionPopup: boolean = false;
  updateQuestion: any;
  viewSubQuestionArr: any = []
  selectedsubQuestiondata;
  questionCheckboxStatus: boolean = false;
  updateFieldValue: any
  regxVal = /^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};':"\\|,.<>\/?]*$/
  chipsArr: any = [];
  removable = true;
  addOnBlur = true;
  selectedChipsValue: any;
  previousQuestionType: string = "";
  showQuestionValidationMessage: boolean = false;
  pdfOpen: boolean = false
  public config = Common.config;
  timer: number = Common.timeout;
  searchFilter: string = "";
  searchSubFilter: string = "";
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Question Master', current: true },
    ],
  };
  isLoading: boolean = false
  isGenerating: boolean = false
  public scroll = Common.scroll
  updating: boolean = false
  placeholder: string;
  levelName: string;
  isViewClick: boolean = false;
  isSubViewClick: boolean = false;
  constructor(private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private masterSettingService: MasterSettingService,
    private toast: ToastService) {

    this.questionForm = this.formBuilder.group({
      question: new FormControl('', [Validators.required, Validators.pattern(this.regxVal), Validators.minLength(3)]),
      questionType: new FormControl(null, [Validators.required]),
      questionCode: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)]),
      status: new FormControl(null, [Validators.required]),
      questionLabel: new FormControl(null),
      numericCheckbox: new FormControl(null)
    });
    this.questionForm.controls['status'].setValue(this.default);

    this.subQuestionForm = this.formBuilder.group({
      question: new FormControl('', [Validators.required]),
      subQuestion: new FormControl('', [Validators.required, Validators.pattern(this.regxVal), Validators.minLength(3)]),
      subQuestionType: new FormControl(null, [Validators.required]),
      subQuestionCode: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)]),
      status: new FormControl(null, [Validators.required]),
      questionLabel: new FormControl(null),
      numericCheckbox: new FormControl(null)
    });
    this.subQuestionForm.controls['status'].setValue(this.default);

    this.createdById = (sessionStorage.getItem("userId"));
  }

  ngOnInit() {
    this.toast.dismissSnackBar()
    this.selectQuestionType(null);
    this.viewQuestionReport();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  sortDataSub() {
    this.dataSourceSubQuestion.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  selectQuestionType(type) {
    this.dataservice.questionType({ "type": type }).subscribe(res => {

      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.success == true) {
        this.questionTypeArr = resJSON?.result;
      } else {
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }


  onSelectChange(data) {
    this.updateQuestion = data;
    // for empty the selected array on every value change
    if (this.updatedId == 0) {
      this.chipsArr = [];
    }
    this.showQuestionValidationMessage = false;
    this.questionForm.controls['questionLabel'].setValue(null);
    this.subQuestionForm.controls['questionLabel'].setValue(null);
    if (data?.answerType == 'Multiple Choice' || data?.answerType == 'Drop Down' || data?.answerType == 'Check Box') {
      this.isShowOption = true
      this.isShowCheckbox = false;
      this.levelName = 'Option'
      this.placeholder = 'Enter Option'
    }
    else if (data?.answerType == 'Multiple Text Box') {
      this.isShowCheckbox = true;
      this.isShowOption = true;
      this.levelName = 'Label Name'
      this.placeholder = 'Enter Label Name'
    }
    else if (data?.answerType == 'Single Text Box') {
      this.isShowCheckbox = true;
      this.isShowOption = false;
    }
    else {
      this.isShowCheckbox = false;
      this.isShowOption = false;
    }
    if (this.openChangeQuestionPopup == true) {
      this.isConfirmPopup = true;
    }
    else {
      this.questionTypeID = data?.id;

    }

  }

  changeQuestion(value) {
    if (value) {
      this.chipsArr = [];
      this.questionTypeID = this.updateQuestion?.id;
      this.previousQuestionType = this.updateQuestion?.answerType;
      if (this.updateQuestion?.answerType == 'Multiple Choice' || this.updateQuestion?.answerType == 'Drop Down' || this.updateQuestion?.answerType == 'Check Box') {
        this.isShowOption = true;
        this.isConfirmPopup = false;
        this.isShowCheckbox = false;
        this.levelName = 'Option'
        this.placeholder = 'Enter Option'
      }
      else if (this.updateQuestion?.answerType == 'Multiple Text Box') {
        this.isShowCheckbox = true;
        this.isShowOption = true;
        this.isConfirmPopup = false;
        this.levelName = 'Label Name'
        this.placeholder = 'Enter Label Name'
      }
      else if (this.updateQuestion?.answerType == 'Single Text Box') {
        this.isShowCheckbox = true;
        this.isShowOption = false;
        this.isConfirmPopup = false;
      }
      else {
        this.isShowCheckbox = false;
        this.isShowOption = false;
        this.isConfirmPopup = false;
      }
    }
    else {
      this.questionForm.controls['questionType'].setValue(this.previousQuestionType); // single field set
      this.subQuestionForm.controls['subQuestionType'].setValue(this.previousQuestionType);
      if (this.previousQuestionType == 'Multiple Choice' || this.previousQuestionType == 'Drop Down' || this.previousQuestionType == 'Check Box') {
        this.isShowOption = true;
        this.isConfirmPopup = false;
        this.isShowCheckbox = false;
      }
      else if (this.previousQuestionType == 'Multiple Text Box') {
        this.isShowCheckbox = true;
        this.isShowOption = true;
        this.isConfirmPopup = false;
      }
      else if (this.previousQuestionType == 'Single Text Box') {
        this.isShowCheckbox = true;
        this.isShowOption = false;
        this.isConfirmPopup = false;
      }
      else {
        this.isShowCheckbox = false;
        this.isShowOption = false;
        this.isConfirmPopup = false;
      }
    }
  }

  // *********************************** CHIP SECTION START ****************************************************
  // ***************************************************************************************

  // new chip add function

  addLabel(formName: string, event?: any) {
    let value = "";
    if (formName == "subquestionForm") {
      value = event?.target?.value || this.subQuestionForm.controls['questionLabel'].value;
    } else {
      value = event?.target?.value || this.questionForm.controls['questionLabel'].value;
    }
    if ((value || '').trim()) {
      this.showQuestionValidationMessage = false;
      let chipData = value.replace(/(<([^>]+)>)/ig, "").trim();
      if (this.chipsArr.length > 15) {
        this.toast.showMessage("You can add upto 15 Label Names", '', 'success');
        return;
      } else {
        this.chipsArr.push(chipData);
      }
    } else {
      this.showQuestionValidationMessage = true;
    }
    if (value) {
      this.questionForm.controls['questionLabel'].setValue(null);
      this.subQuestionForm.controls['questionLabel'].setValue(null);
    }
    this.selectedChipsValue = this.chipsArr.join('||');
  }


  removeChip(item: any): void {
    const index = this.chipsArr.indexOf(item);
    if (index >= 0) {
      this.chipsArr.splice(index, 1);
    }
    this.selectedChipsValue = this.chipsArr.length > 0 ? this.chipsArr.join('||') : '';
  }

  // *********************************** CHIP SECTION END ****************************************************
  // ***************************************************************************************
  questionCheckbox(event) {
    if (event.target.checked) {
      this.questionCheckboxStatus = event.target.checked
    } else {
      this.questionCheckboxStatus = event.target.checked
    }
  }

  backButtonClick() {
    this.chipsArr = [];
    this.isShowOption = false;
    this.isShowCheckbox = false;
    this.isShowButton = true;
    this.isViewClick = false;
    this.isSubViewClick = false;
    this.isDeleteQuestion = true;
    this.selectQuestionType(null);
    this.questionForm.reset();
    this.questionForm.enable();
    this.questionMSG = 'Add Question';
    this.questionForm.controls['status'].setValue(this.default);
    this.subQuestionForm.reset();
  }

  viewQuestionReport() {
    let message;
    this.isLoading = true;
    this.dataSource = new MatTableDataSource<any>();
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: '',
    };
    let obj = {
      "surveyId": null,
      "domainId": null,
      "subDomainId": null
    }

    this.dataservice.viewQuestion(obj).subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.success == true) {
        this.viewQuestionArr = resJSON?.result;
        this.dataSource = new MatTableDataSource<any>(this.viewQuestionArr);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  onSubmit(action) {
    this.isSubmitted = true;
    this.updating = true
    let questionsTypeSelected = this.questionTypeArr?.find((item: any) => item?.id == this.questionTypeID);
    if (this.questionForm.invalid) {
      this.updating = false
      return
    } else if ((questionsTypeSelected?.answerType == 'Multiple Choice' || questionsTypeSelected?.answerType == 'Drop Down' || questionsTypeSelected?.answerType == 'Multiple Text Box' || questionsTypeSelected?.answerType == 'Check Box') && this.chipsArr?.length == 0) {
      this.updating = false
      this.toast.showMessage('Please enter atleast one' + ' ' + `${this.levelName.toLowerCase()}`, '', 'success');
      return;
    } else {
      var statusValue, message
      if (this.questionForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      if (action == 'save') {
        this.updatedId = 0;
        message = 'You have successfully saved the data'
      }
      else if (action == 'update') {
        this.questionMSG = 'Add Question';
        message = 'You have successfully updated the data'
      }
      this.selectedChipsValue = this.chipsArr.length > 0 ? this.chipsArr.join('||') : '';
      let question = this.questionForm.value.question.replace(/(<([^>]+)>)/ig, "").trim();
      let data = {
        "id": this.updatedId,
        "question": question,
        // "question": this.questionForm.value.question.replace(/ {2,}/g, ' ').trim(),
        "questionCode": parseInt(this.questionForm.value.questionCode),
        //"options": this.questionForm.value.option?.replace(/ {2,}/g, ' ').trim() ? this.questionForm.value.option.replace(/ {2,}/g, ' ').trim() : '',
        "options": this.selectedChipsValue ? this.selectedChipsValue : '',
        "status": statusValue,
        "loggedInUserId": parseInt(this.createdById),
        "questionTypeMaster": {
          "id": this.questionTypeID
        },
        "onlyNumeric": this.questionCheckboxStatus,
      }

      this.dataservice.createQuestion(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmitted = false
        if (resJSON.success == true) {
          this.isShowOption = false
          this.isShowButton = true;
          this.toast.showMessage(message, '', 'success')
          this.viewQuestionReport();
          this.questionForm.reset();
          this.isShowCheckbox = false;
          this.questionCheckboxStatus = false;
          this.questionForm.controls['status'].setValue(this.default);
          this.openChangeQuestionPopup = false;
          this.updatedId = 0;
          this.searchFilter = "";
          this.searchSubFilter = "";
          this.updating = false
        }
        else {
          this.updating = false
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.updating = false
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    }
  }

  onCancle() {
    this.isShowOption = false;
    this.isShowCheckbox = false;
    this.isViewClick = false;
    this.isSubViewClick = false;
    this.isShowButton = true;
    this.questionMSG = 'Add Question';
    this.questionForm.reset();
    this.questionForm.enable();
    this.chipsArr = []
    this.openChangeQuestionPopup = false
    this.questionForm.controls['status'].setValue(this.default);
  }

  edit(selectedItem: any, button: any) {
    // if(this.subQuestionForm){
    //   if (button == "subedit") {
    //     this.subQuestionMSG = 'Edit sub Question';
    //     this.isViewClick = false;
    //     this.questionForm.enable();
    //   } else {
    //     this.subQuestionMSG = 'View sub Question';
    //     this.isViewClick = true;
    //     this.questionForm.disable();
    //   }
    // }
    // if (button == "edit") {
    //   this.questionMSG = 'Edit Question';
    //   this.isViewClick = false;
    //   this.questionForm.enable();
    // } else {
    //   this.questionMSG = 'View Question';
    //   this.isViewClick = true;
    //   this.questionForm.disable();
    // }

    this.isShowButton = false
    this.questionTypeArr.forEach(element => {
      if (element?.answerType == selectedItem?.questionTypeMaster?.answerType) {
        this.questionTypeID = selectedItem?.questionTypeMaster?.id
      }
    });
    this.updatedId = selectedItem?.id;
    this.updateFieldValue = selectedItem
    this.openChangeQuestionPopup = true;
    let focus, statusValue
    if (selectedItem?.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }
    this.chipsArr = [];
    if (selectedItem?.questionTypeMaster?.answerType == 'Multiple Choice' || selectedItem?.questionTypeMaster?.answerType == 'Drop Down' || selectedItem?.questionTypeMaster?.answerType == 'Check Box') {
      this.isShowOption = true;
      this.isShowCheckbox = false;
      this.levelName = 'Option'
      this.placeholder = 'Enter Option'
      this.chipsArr = selectedItem?.options?.split('||')?.[0] != '' ? selectedItem?.options?.split('||') : []
    }
    else if (selectedItem?.questionTypeMaster?.answerType == 'Multiple Text Box') {
      this.isShowCheckbox = true;
      this.isShowOption = true;
      this.levelName = 'Label Name'
      this.placeholder = 'Enter Label Name'
      this.chipsArr = selectedItem?.options?.split('||')?.[0] != '' ? selectedItem?.options?.split('||') : []
    }
    else if (selectedItem?.questionTypeMaster?.answerType == 'Single Text Box') {
      this.isShowCheckbox = true;
      this.isShowOption = false;
    }
    else {
      this.isShowCheckbox = false
      this.isShowOption = false
    }
    if (this.isDeleteQuestion) {
      if (button == "edit") {
        this.questionMSG = 'Edit Question';
        this.isViewClick = false;
        this.questionForm.enable();
      } else {
        this.questionMSG = 'View Question';
        this.isViewClick = true;
        this.questionForm.disable();
      }
      this.isShowButton = false;
      this.questionForm.patchValue({
        'question': selectedItem?.question, 'questionCode': selectedItem?.questionCode,
        'status': statusValue, 'option': selectedItem?.options, 'questionType': selectedItem?.questionTypeMaster?.answerType,
        'numericCheckbox': selectedItem?.onlyNumeric
      });
    }
    else {
      if (button == "subedit") {
        this.subQuestionMSG = 'Edit sub Question';
        this.isSubViewClick = false;
        this.subQuestionForm.enable();
      } else {
        this.subQuestionMSG = 'View sub Question';
        this.isSubViewClick = true;
        this.subQuestionForm.disable();
      }
      // this.subQuestionMSG = 'Edit Sub Question'
      this.isShowSubButton = false;
      this.subQuestionForm.patchValue({
        'subQuestion': selectedItem?.subQuestion, 'subQuestionType': selectedItem?.questionTypeMaster?.answerType,
        'subQuestionCode': selectedItem?.subQuestionCode, 'option': selectedItem?.options, 'status': statusValue,
        'numericCheckbox': selectedItem?.onlyNumeric
      })
    }
    this.previousQuestionType = selectedItem?.questionTypeMaster?.answerType;
    focus = document.getElementById('focusForm')
    focus.scrollIntoView()
  }

  remove(selectedItem) {
    this.isShowPopup = true
    this.removequestionID = selectedItem
  }

  removeRecord(item) {
    let message;
    if (item) {
      let obj = {
        "id": this.removequestionID?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      if (this.isDeleteQuestion) {
        this.dataservice.deleteQuestion(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.isShowPopup = false
            this.onCancle();
            this.viewQuestionReport();
          }
          else {
            this.isShowPopup = false
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      } else {
        this.dataservice.deleteSubQuestion(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.isShowPopup = false
            this.cancleSubQuestion();
            this.viewSubQuestionReport();
          }
          else {
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      }
    }
    else {
      this.isShowPopup = false
    }
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

  subQuestion(data) {
    this.chipsArr = [];
    this.previousQuestionType = "";
    this.subQuestionForm.controls['subQuestionType'].setValue(null);
    this.openChangeQuestionPopup = false;
    this.isDeleteQuestion = false;
    this.isShowOption = false
    this.isSubquestion = true;
    this.isShowCheckbox = false;
    this.subQuestionForm.controls['status'].setValue(this.default)
    this.subQuestionForm.controls['question'].setValue(data.question);
    this.selectQusetionID = data?.id
    this.selectedsubQuestiondata = data
    this.viewSubQuestionReport();
    this.selectQuestionType('subquestion');
    // this.searchFilter = "";
    // this.searchSubFilter = "";
  }

  applyFilter(event: any, action: string) {
    let filterValue = action == 'subquestion' ? this.searchSubFilter : this.searchFilter;
    // let filterValue = event?.target?.value;
    if (action == 'question') {
      if (filterValue.length > 0) {
        let roleFilters = this.viewQuestionArr.filter((x: any) => {
          return (
            (x.question
              ?.toLocaleLowerCase()
              .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
            (x.questionCode.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
            (x?.questionTypeMaster?.answerType.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue.trim().toLocaleLowerCase()) > -1)
          );
        });
        this.dataSource = new MatTableDataSource<any>(roleFilters);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      } else {
        this.dataSource = new MatTableDataSource<any>(this.viewQuestionArr);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      }
    } else {
      if (filterValue.length > 0) {
        let menuFilters = this.viewSubQuestionArr.filter((x: any) =>
          (x?.questionMaster?.question
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x?.subQuestion?.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x.subQuestionCode.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x.questionTypeMaster?.answerType.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1)
        );
        this.dataSourceSubQuestion = new MatTableDataSource<any>(menuFilters);
        this.dataSourceSubQuestion.paginator = this.viewsubtable;
        this.dataSourceSubQuestion.sort = this.sortSub;
        this.sortDataSub();
      } else {
        this.dataSourceSubQuestion = new MatTableDataSource<any>(this.viewSubQuestionArr);
        this.dataSourceSubQuestion.paginator = this.viewsubtable;
        this.dataSourceSubQuestion.sort = this.sortSub;
        this.sortDataSub();
      }
    }
  }
  //  ************************************** SUB QUESTION SECTION *****************************************
  // ********************************************************************************************************


  viewSubQuestionReport() {
    this.viewSubQuestionArr = []
    let message: any;
    this.dataSourceSubQuestion = new MatTableDataSource<any>();
    this.dataservice.viewSubQuestion().subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.success == true) {
        resJSON?.result.forEach(element => {
          if (element?.questionMaster?.question == this.selectedsubQuestiondata?.question) {
            this.viewSubQuestionArr.push(element)
          }
        });
        this.dataSourceSubQuestion = new MatTableDataSource<any>(this.viewSubQuestionArr);
        this.dataSourceSubQuestion.paginator = this.viewsubtable;
        this.dataSourceSubQuestion.sort = this.sort;
        this.sortDataSub();
      } else {
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  onSubmitSubQuestion(action) {
    this.isSubmittedSubQue = true;
    this.updating = true
    let questionsTypeSelected = this.questionTypeArr?.find((item: any) => item?.id == this.questionTypeID);
    if (this.subQuestionForm.invalid) {
      this.updating = false
      return
    } else if ((questionsTypeSelected?.answerType == 'Multiple Choice' || questionsTypeSelected?.answerType == 'Drop Down' || questionsTypeSelected?.answerType == 'Multiple Text Box' || questionsTypeSelected?.answerType == 'Check Box') && this.chipsArr?.length == 0) {
      this.updating = false
      // this.showAlert("Please enter atleast one label name");
      this.toast.showMessage('Please enter atleast one' + ' ' + `${this.levelName.toLowerCase()}`, '', 'success');
      return;
    } else {
      var statusValue, message
      if (this.subQuestionForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      if (action == 'save') {
        this.updatedId = 0;
        message = 'You have successfully saved the data'
      }
      else if (action == 'update') {
        this.subQuestionMSG = 'Add Sub Question'
        message = 'You have successfully updated the data'
        this.isShowSubButton = true;
      }
      this.selectedChipsValue = this.chipsArr.length > 0 ? this.chipsArr.join('||') : '';
      let subQuestion = this.subQuestionForm.value.subQuestion.replace(/(<([^>]+)>)/ig, "").trim();

      let data = {
        "id": this.updatedId,
        "subQuestion": subQuestion,
        "subQuestionTypeMaster": {
          "id": this.questionTypeID,
        },
        "subQuestionCode": parseInt(this.subQuestionForm.value.subQuestionCode),
        // "options": this.subQuestionForm.value.option?.replace(/ {2,}/g, ' ').trim() ? this.subQuestionForm.value.option.replace(/ {2,}/g, ' ').trim() : '',
        "options": this.selectedChipsValue ? this.selectedChipsValue : '',
        "status": statusValue,
        "loggedInUserId": parseInt(this.createdById),
        "questionMaster": {
          "id": this.selectQusetionID
        },
        "onlyNumeric": this.questionCheckboxStatus,
      }
      this.dataservice.createSubQuestion(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmittedSubQue = false
        if (resJSON.success == true) {
          this.isShowButton = true
          this.viewSubQuestionReport();
          this.toast.showMessage(message, '', 'success');
          this.subQuestionForm.reset();
          this.isShowOption = false;
          this.isShowCheckbox = false;
          this.subQuestionForm.controls['question'].setValue(this.selectedsubQuestiondata?.question);
          this.subQuestionForm.controls['status'].setValue(this.default);
          this.openChangeQuestionPopup = false;
          this.updatedId = 0;
          this.searchSubFilter = "";
          this.updating = false
        }
        else {
          this.isShowButton = false
          this.updating = false
          message = resJSON?.errorMessage
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.updating = false
        message = 'Something went wrong!'
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    }

  }
  cancleSubQuestion() {
    this.openChangeQuestionPopup = false;
    this.subQuestionMSG = 'Add Sub Question'
    this.isShowSubButton = true;
    this.isShowOption = false;
    this.isViewClick = false;
    this.isSubViewClick = false;
    this.isShowCheckbox = false;
    this.subQuestionForm.reset();
    this.subQuestionForm.enable();
    this.chipsArr = []
    this.subQuestionForm.controls['status'].setValue(this.default);
    this.subQuestionForm.controls['question'].setValue(this.selectedsubQuestiondata.question);
  }
  printPDF() {
    this.pdfOpen = true;
    this.isGenerating = true
    setTimeout(() => {
      this.print.print('print-pdf', this.config);
      // this.printPage.printPage()
      this.pdfOpen = false
      this.isGenerating = false
    }, 500);

  }

  exportExcel() {
    this.isGenerating = true
    const headers: any = !this.isSubquestion ? ['Question', 'Type', 'Code', 'Status'] : ['Question', 'Sub Question', 'AnswerType', 'Code', 'Status']
    let responseData = structuredClone(this.isSubquestion ? this.dataSourceSubQuestion.filteredData : this.dataSource.filteredData)

    if (!this.isSubquestion) {
      responseData.forEach((element: any) => {
        element['Question'] = element['question'].replaceAll(",", "-");
        element['Type'] = element['questionTypeMaster']['answerType']
        element['Code'] = element['questionCode']
        element['Status'] = element['status'] ? 'Active' : 'Inactive'
      });
    }

    if (this.isSubquestion) {
      responseData.forEach((element: any) => {
        element['Question'] = element['questionMaster']['question'].replaceAll(",", "-");
        element['Sub Question'] = element['subQuestion'].replaceAll(",", "-");
        element['AnswerType'] = element['questionTypeMaster']['answerType']
        element['Code'] = element['subQuestionCode']
        element['Status'] = element['status'] ? 'Active' : 'Inactive'
      });
    }

    setTimeout(() => {
      this._ExcelService.downloadFile(responseData, 'question_master', headers);
      this.isGenerating = false
    }, 500);
  }

}
