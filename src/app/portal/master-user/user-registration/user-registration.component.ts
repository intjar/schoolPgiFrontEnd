import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ManageUserService } from 'src/app/services/manage-user.service';
import { ToastService } from 'src/app/services/toast';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent {
  displayedColumns = [
    'sn',
    'name',
    'username',
    'email',
    'mobile',
    'instance',
    'role',
    'level',
    'status',
    'action',
  ];

  displayedColumnsForUploadExcelModal = [
    'sn',
    'name',
    'username',
    'email',
    'mobile',
    'instance',
    'role',
    'level',
    'status',
    'Errors',
  ];
  dataSource = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('file') file!: ElementRef;

  userRegistrationForm: any = FormGroup;
  instanceDataArr: any = [];
  instanceRecordArr: any = [];
  levelDataArr: any = [];
  roleDataArr: any = [];
  isShowButton: boolean = true;
  selectInstanceID: any;
  assignLevelID: any;
  assignRoleID: any;
  msg: string;
  isVisible: boolean = false;
  isSubmitted: boolean = false;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  useRegMSG = 'User Registration';
  createdById;
  userID;
  instanceDataSource: any = [];
  levelDataSource;
  roleDataSource: any = [];
  displayStyle = 'none';
  dataRecord;
  regxVal = /^[a-zA-Z@.0-9_-]*$/;
  isShowPopup: boolean = false;
  disbaleButton: boolean = false;
  isLoading: boolean = false;
  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  printDataSource: any;
  pdfOpen: boolean = false;
  public config = Common.config;
  timer: number = Common.timeout;
  searchValue: string = ''
  error: boolean = false;
  breadcrums = {
    heading: ' Manage User',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage User' },
      { link: 'User Registration', current: true },
    ],
  };
  isGenerating: boolean = false
  isUpdating: boolean = false
  levelRoleArr: any = []
  public scroll = Common.scroll
  isViewClick: boolean = false;

  bulkUploadDataSource= new MatTableDataSource<any>();
  isOpenModal: boolean = false;
  isOpenModal2: boolean = false;
  displayStyleForBulkUpload  = 'block';
  isUpload: boolean;
  uploadArr: any[] = [];
  fileUploadAllowed: string = '.xlsx';
  isSelectedFile: boolean = true;
  formData: any;

  constructor(
    private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private manageUserService: ManageUserService,
    public print: NgxPrintElementService,
    private _ExcelService: ExcelService,
    private toast: ToastService
  ) {
    this.userRegistrationForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, this.removeSpaces]),
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        this.removeSpaces,
        Validators.pattern(this.regxVal),
      ]),
      mobile: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
      ]),
      selectInstance: new FormControl(null, [Validators.required]),
      assignLevel: new FormControl(null, [Validators.required]),
      assignRole: new FormControl(null, [Validators.required]),
      status: new FormControl('', [Validators.required]),
    });
    this.userRegistrationForm.controls['status'].setValue(this.default);
    this.createdById = sessionStorage.getItem('userId');
  }

  removeSpaces(control: AbstractControl) {
    if (control && control.value && !control.value.replace(/\s/g, '').length) {
      control.setValue('');
    }
    return null;
  }

  ngOnInit() {
    this.toast.dismissSnackBar();

    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    this.viewUserReport('page', this.payLoadsViewUser);
    this.fetchSelectData();
  }

  fetchSelectData() {
    let message;
    let obj = {
      "withSchool": true,
      "isDropDown": true
    }
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: '',
    };

    this.manageUserService.viewInstances(payloads, obj).subscribe(
      (res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = res;
        if (resJSON.status) {
          this.instanceDataSource = resJSON?.instances?.result;
          this.instanceRecordArr = resJSON?.instances?.result;
          this.fetchAssignData();
        } else {
          // message = resJSON?.errorMessage
          // this.showAlert(message)
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        // let message = 'Something went wrong!';
        // this.showAlert(message);
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  fetchAssignData() {
    this.levelDataArr = [];
    let message;
    let obj = {
      "isDropDown": "d"
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe(
      (res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = res;
        if (res?.status) {
          this.levelDataSource = resJSON?.result.filter((res: any) => res.status);
          this.levelDataArr = this.levelDataSource
        }
        else {
          // message = resJSON?.errorMessage
          // this.showAlert(message)
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        }


      },
      (error) => {
        // message = 'Something went wrong!';
        // this.showAlert(message);
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
    this.dataservice.addRoleMasterView().subscribe(
      (res) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.roleDataSource = resJSON?.result;
        // this.roleDataSource.forEach((element) => {         
        //   this.roleDataArr.push(element);
        // });
      },
      (error) => {
        // message = 'Something went wrong!';
        // this.showAlert(message);
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  onSelectChange1(data) {
    this.selectInstanceID = data?.id;
  }

  onSelectChange2(data) {
    this.userRegistrationForm.patchValue({
      selectInstance: null,
      assignRole: null
    })
    this.instanceDataArr = [];
    this.roleDataArr = [];
    if (data == undefined) {
      return;
    }
    this.assignLevelID = data?.id;
    let str_Arr = [];
    this.roleDataArr = [];
    this.getInstanceData(data?.id)
    this.getRoleData(data)
    // let instance = structuredClone(this.instanceDataSource)
    // this.instanceDataArr = instance.filter((res:any) => res?.levelId ==  this.assignLevelID)
    // instance.forEach((item) => {
    //   if (this.assignLevelID == item?.levelId) {
    //     this.instanceDataArr.push(item);
    //   }
    // });

    // str_Arr = data?.role_ids.split(',');
    // str_Arr.forEach((element) => {
    //   this.roleDataSource.forEach((item) => {
    //     if (element == item?.id) {
    //       this.roleDataArr.push(item);
    //     }
    //   });
    // });

    // this.roleDataArr = this.roleDataArr.filter((c, index) => {
    //   return this.roleDataArr.indexOf(c) === index;
    // });


    this.userRegistrationForm.controls['selectInstance'].reset();
    this.userRegistrationForm.controls['assignRole'].reset();
  }

  getInstanceData(id: number) {
    let instance = structuredClone(this.instanceDataSource)
    this.instanceDataArr = instance.filter((res: any) => res?.levelId == id && res.status)

  }

  onSelectChange3(data) {
    this.assignRoleID = data?.id;
  }

  getRoleData(data: any) {
    // let role = structuredClone(this.roleDataSource)
    // this.roleDataArr = role.filter((res: any) => res?.id == id && res.status)
    let str_Arr = [];

    str_Arr = data?.role_ids.split(',');
    str_Arr.forEach((element) => {
      this.roleDataSource.forEach((item) => {
        if (element == item?.id && item?.status) {
          this.roleDataArr.push(item);
        }
      });
    });

    this.roleDataArr = this.roleDataArr.filter((c, index) => {
      return this.roleDataArr.indexOf(c) === index;
    });
  }

  viewUserReport(type: string, paylodas: any) {
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];

    paylodas['search'] = this.searchValue

    let request = { loggedInUserId: null, childInstance: false };

    this.manageUserService.viewUsers(paylodas, request).subscribe(
      (res: any) => {
        let resJSON = res;
        if (resJSON?.success) {
          let dataSource = resJSON?.result;
          this.printDataSource = structuredClone(dataSource);
          if (type === 'page') {
            (this.dataSource = new MatTableDataSource<any>(dataSource)),
              (this.isLoading = false),
              (this.totalCount = resJSON?.totalElements);
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
              'Name',
              'User Name',
              'Email Id',
              'Mobile Number',
              'Instance',
              'Assign Role',
              'Assign Level',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);

            itemData.forEach((element: any) => {
              element['Name'] = element['name'];
              element['User Name'] = element['userName'];
              element['Email Id'] = element['emailId'];
              element['Mobile Number'] = element['number'];
              element['Instance'] = element['instance'];
              element['Assign Role'] = element['role'];
              element['Assign Level'] = element['level'];
              element['Status'] = element['status'] ? 'Active' : 'Inactive';
            });
            setTimeout(() => {
              this._ExcelService.downloadFile(
                itemData,
                'user-registration',
                headers
              );
              this.isGenerating = false
            }, 500);
          }
        }
        else {
          // let message = resJSON?.errorMessage;
          // this.showAlert(message);
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
    this.viewUserReport(type, payLoads);
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    this.payLoadsViewUser['pageNo'] = this.pageNumber;
    this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    this.viewUserReport('page', this.payLoadsViewUser);
  }

  filterData(type: string) {

    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    type == 'clear' ? this.searchValue = '' : ''

    this.viewUserReport('page', payloads);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.pageNumber = 0
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
    };
    this.viewUserReport('page', payloads);
  }


  edit(object, button: any) {
    if (button == "edit") {
      this.useRegMSG = 'Edit User';
      this.isViewClick = false;
      this.userRegistrationForm.enable();
    } else {
      this.useRegMSG = 'View User';
      this.isViewClick = true;
      this.userRegistrationForm.disable();
    }
    this.userID = object?.uid;

    let focus, statusValue;
    this.isShowButton = false;
    if (object?.status == true) {
      statusValue = 'Active';
    } else {
      statusValue = 'Inactive';
    }

    this.userRegistrationForm.patchValue({
      name: object?.name,
      username: object?.userName?.toLowerCase(),
      email: object?.emailId,
      mobile: object?.number,
      selectInstance: object?.instance,
      assignLevel: object?.level,
      assignRole: object?.role,
      status: statusValue,
    }); // multiple field set
    focus = document.getElementById('focusForm');
    focus.scrollIntoView();
    this.getInstanceData(object?.levelId)

    // this.levelDataArr?.forEach(element => {
    //   if (element?.id == object?.levelId) {
    //     this.getRoleData(element)
    //   }
    // });

    let levelData = []
    levelData = this.levelDataArr?.filter((item: any) => item?.id == object?.levelId)
    this.getRoleData(levelData[0]);
    // this.getRoleData(object)
    // this.instanceDataSource.forEach((item) => {
    //   if (this.assignLevelID == item?.levelId) {
    //     this.instanceDataArr.push(item);
    //   }
    // });

    this.selectInstanceID = object?.instanceId
    this.assignLevelID = object?.levelId
    this.assignRoleID = object?.roleId

    // this.instanceRecordArr.forEach((element) => {
    //   if (element?.instance == object?.instance) {
    //     this.selectInstanceID = element?.id;
    //   }
    // });

    // this.levelDataArr.forEach((element) => {
    //   if (element?.level_name == object?.level) {
    //     this.assignLevelID = element?.id;
    //   }
    // });
    // this.roleDataArr.forEach((element) => {
    //   if (element?.name == object?.role) {
    //     this.assignRoleID = element?.id;
    //   }
    // });
  }

  onSubmit(action) {
    this.isSubmitted = true;
    this.disbaleButton = true;
    if (this.userRegistrationForm.invalid) {
      this.disbaleButton = false;
      return;
    } else {
      var statusValue, message;
      if (this.userRegistrationForm.value.status == 'Active') {
        statusValue = true;
      } else {
        statusValue = false;
      }
      let data = {
        name: this.userRegistrationForm.value.name
          .replace(/ {2,}/g, ' ')
          .trim(),
        username: this.userRegistrationForm.value.username
          .replace(/ {2,}/g, ' ')
          .trim().toLowerCase(),
        email: this.userRegistrationForm.value.email
          .replace(/ {2,}/g, ' ')
          .trim(),
        mobileNo: parseInt(this.userRegistrationForm.value.mobile),
        levelId: this.assignLevelID,
        instanceId: this.selectInstanceID,
        roleId: this.assignRoleID,
        loggedInUserId: parseInt(this.createdById),
        status: statusValue,
      };
      if (action == 'save') {
        this.dataservice.createUser(data).subscribe(
          (res) => {
            let resSTR = JSON.stringify(res);
            let resJSON = JSON.parse(resSTR);
            this.isSubmitted = false;
            if (resJSON.success == true) {
              this.instanceDataArr = [];
              this.roleDataArr = [];
              this.disbaleButton = false;
              this.pageNumber = 0
              // message = 'You have successfully saved the data';
              // this.showAlert(message);
              this.toast.showMessage('You have successfully saved the data', '', 'success');
              let payloads = {
                pageNo: 0,
                sortOrder: 'desc',
                search: '',
              };
              this.viewUserReport('page', payloads);
              this.userRegistrationForm.reset();
              this.userRegistrationForm.controls['status'].setValue(
                this.default
              );
            } else {
              // message = resJSON?.errorMessage;
              // this.showAlert(message);
              this.disbaleButton = false;
              this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');

            }
          },
          (error) => {
            this.disbaleButton = false;
            // message = 'Something went wrong!';
            // this.showAlert(message);
            this.toast.showMessage('Something went wrong!', '', 'unsuccess');
          }
        );
      }
      if (action == 'update') {
        data['id'] = this.userID;
        this.dataservice.updateUser(data).subscribe(
          (res) => {
            let resSTR = JSON.stringify(res);
            let resJSON = JSON.parse(resSTR);
            this.isSubmitted = false;
            if (resJSON.success == true) {
              this.instanceDataArr = [];
              this.roleDataArr = [];
              this.isShowButton = true;
              this.disbaleButton = false;
              this.searchValue = ''
              this.useRegMSG = 'User Registration';
              this.pageNumber = 0
              // message = 'You have successfully updated the data';
              // this.showAlert(message);
              this.toast.showMessage('You have successfully updated the data', '', 'success');
              this.viewUserReport('page', this.payLoadsViewUser);
              this.userRegistrationForm.reset();
              this.userRegistrationForm.controls['status'].setValue(
                this.default
              );
            } else {
              this.disbaleButton = false;
              // message = resJSON?.errorMessage;
              // this.showAlert(message);
              this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
            }
          },
          (error) => {
            this.disbaleButton = false;
            // message = 'Something went wrong!';
            // this.showAlert(message);
            this.toast.showMessage('Something went wrong!', '', 'success');
          }
        );
      }
    }
  }

  onCancle() {
    this.instanceDataArr = [];
    this.roleDataArr = [];
    this.isSubmitted = false;
    this.useRegMSG = 'User Registration';
    this.isShowButton = true;
    this.isViewClick = false;
    this.userRegistrationForm.enable();
    this.userRegistrationForm.reset();
    this.userRegistrationForm.controls['status'].setValue(this.default);
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data;
  //   setTimeout(() => (this.isVisible = false), this.timer);
  // }

  remove(object: any) {
    this.isShowPopup = true;
    this.dataRecord = object;
  }

  removeRecord(item) {

    if (item) {
      this.isGenerating = true
      this.instanceRecordArr.forEach((element) => {
        if (element?.instance == this.dataRecord?.instance) {
          this.selectInstanceID = element?.id;
        }
      });
      this.levelDataArr.forEach((element) => {
        if (element?.level_name == this.dataRecord?.level) {
          this.assignLevelID = element?.id;
        }
      });
      this.roleDataArr.forEach((element) => {
        if (element?.name == this.dataRecord?.role) {
          this.assignRoleID = element?.id;
        }
      });
      let data = {
        id: this.dataRecord?.uid,
        name: this.dataRecord?.name,
        username: this.dataRecord?.userName.toLowerCase(),
        email: this.dataRecord?.emailId,
        mobileNo: parseInt(this.dataRecord?.number),
        levelId: this.assignLevelID,
        instanceId: this.selectInstanceID,
        roleId: this.assignRoleID,
        loggedInUserId: parseInt(this.createdById),
        status: this.dataRecord?.status,
      };
      this.dataservice.deleteUser(data).subscribe(
        (res) => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.isShowPopup = false;
            this.viewUserReport('page', this.payLoadsViewUser);
            this.displayStyle = 'none';
            this.isGenerating = false
          } else {
            this.isShowPopup = false;
            this.isGenerating = false
            // let msg = resJSON?.errorMessage;
            // this.showAlert(msg);
            this.toast.showMessage(resJSON?.errorMessage, '', 'success');

          }
        },
        (error) => {
          this.isGenerating = false
          // let message = 'Something went wrong!';
          // this.showAlert(message);
          this.toast.showMessage('Something went wrong!', '', 'success');
        }
      );
    } else {
      this.isShowPopup = false;
    }
  }

  differentPass(event: any) {
    if (this.userRegistrationForm.get('username')?.value == event?.target?.value) {
      this.error = true
    }
    else {
      this.error = false
    }
  }


  
  selectFile(event: any) {
    console.log('hey')
    this.uploadArr = event.target.files
    this.isLoading = true;
    const files = this.file?.nativeElement?.files;


    if ( this.uploadArr?.length != 0) {
      if (this.uploadArr[0]?.size > 200000000) {
        this.isLoading = false
        this.toast.showMessage('File must be less than 200MB', '', 'unsuccess');
      } else if (this.uploadArr?.length > 0 && this.fileUploadAllowed?.indexOf(  this.uploadArr[0]?.name?.split('.')[1]) == -1) {
        this.isLoading = false
        this.uploadArr = []
        this.toast.showMessage('Only XLSX  file allowed', '', 'unsuccess');
      }
      else {
        this.isSelectedFile = false;
        this.formData = new FormData();
        this.formData.append('file',   this.uploadArr[0] as File);
        // this.formData.append('instanceId', this.result?.result_det?.[0]?.instance_id);
      }
    }
    else {
      this.isLoading = false
      this.uploadArr = []
    }
  }

  uploadFile(event: any, action: string) {
    console.log(this.uploadArr)
    if (this.uploadArr?.length != 0) {
      console.log('file')
      if (action == 'file') {
        this.isUpload = false;
        this.isOpenModal = false;
        this.isOpenModal2 = true;  
      }
      else if (action == 'table') {
        console.log('table') 
        this.isUpload = true;
      }
      this.isLoading = false;

      
    let data = [
      {
        name : 'Vishal',
        userName : 'vishal021',
        emailId : 'vishal@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Viewer',
        level : 'State',
        status : true,
        error : ''
      },
      {
        name : 'Rahul',
        userName : 'vishal021',
        emailId : 'vishal@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Viewer',
        level : 'State',
        status : true,
        error : 'Existing User'
      },
      {
        name : 'Ravi',
        userName : 'Ravi021',
        emailId : 'Ravi@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Re-Viewer',
        level : 'State',
        status : true,
        error : ''
      },
      {
        name : 'Vishal',
        userName : 'vishal021',
        emailId : 'vishal@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Viewer',
        level : 'State',
        status : true,
        error : ''
      },
      {
        name : 'Vishal',
        userName : 'vishal021',
        emailId : 'vishal@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Viewer',
        level : 'State',
        status : true,
        error : 'Existing User'
      },
      {
        name : 'Vishal',
        userName : 'vishal021',
        emailId : 'vishal@gmail.com',
        number : 1234567890,
        instance : 'Utter pradesh',
        role : 'Viewer',
        level : 'State',
        status : true,
        error : ''
      },
    ];


    this.bulkUploadDataSource = new MatTableDataSource<any>(data)
      // let obj = {
      //   'surveyId': this.result?.result_head[0]?.survey_id,
      //   'loginUserid': this.getSession?.uid,
      //   'isUpload': this.isUpload,
      // }

      // this.surveyDataEntryService.getuploadsurveyexcel(this.formData, obj).subscribe((res: any) => {
      //   console.log('res?.result', res.result)
      //   if (res?.success) {
      //     let error
      //       res?.result.filter((item:any)=> {
      //          error = item?.errorMessage
      //       })
      //       if(error){
      //         this.toast.showMessage(error, '', 'unsuccess');
      //       }else{
      //         this.dataSource = new MatTableDataSource<any>(res?.result);
      //         let totalResult =  res?.result.filter((response:any)=> response?.error?.length > 0 )
      //         totalResult.length  > 0 ?  (this.isShowButton = true) : (this.isShowButton = false)  
      //         this.isLoading = false
      //         this.isOpenModal2 = true;              
      //         if (action == 'table') {
      //           this.isload = true;
      //           this.isOpenModal2 = false; 
      //           this.toast.showMessage(res?.message, '', 'success');
      //           setTimeout(()=>{
      //             this.isload = false;
      //             this.back.emit(true);
      //           },1000)
               
      //         }

      //       }           
      //   } else {
      //     this.isSelectedFile = true;
      //     this.isLoading = false
      //     this.toast.showMessage(res?.result[0]?.errorMessage, '', 'unsuccess');

      //   }
      // },
      //   (error) => {
      //     this.isLoading = false
      //     let message = 'Something went wrong!!'
      //     this.toast.showMessage(message, '', 'unsuccess');
      //   });
    }
    else {
      this.isLoading = false
      this.toast.showMessage('File not uploaded!!', '', 'unsuccess');
    }

  }

  removefile() {
    this.isSelectedFile = true;
    this.uploadArr = []
  }

  downloadUserFormat(){
      //template file in your assets folder
      const fileUrl = 'assets/download-format/user-registration.xlsx';
    
      // Download the file using FileSaver.js
      FileSaver.saveAs(fileUrl, 'user-registration.xlsx');

  }

}
