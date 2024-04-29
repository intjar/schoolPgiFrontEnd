import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ManageUserService } from 'src/app/services/manage-user.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-child-user-registration',
  templateUrl: './child-user-registration.component.html',
  styleUrls: ['./child-user-registration.component.scss']
})
export class ChildUserRegistrationComponent {
  displayedColumns = ['sn', 'name', 'username', 'email', 'mobile', 'instance', 'role', 'level', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  childUserRegistrationForm: any = FormGroup;
  statusValue: string[] = ['Active', 'Inactive'];
  isSubmitted: boolean = false;
  levelDataArr: any = []
  roleDataArr: any = []
  instanceDataArr: any = [];
  default: string = 'Active';
  userNamePattern = /^[a-zA-Z0-9_-]*$/;
  emailRegxVal = /^[a-zA-Z@.0-9_-]*$/;
  createdById: any;
  userDetails: any;
  levelId: number;
  isVisible: boolean = false;
  msg: string;
  assignLevelID: any;
  instanceDataSource: any = [];
  instanceRecordArr: any = [];
  levelDataSource: any = [];
  roleDataSource: any = [];
  isShowButton: boolean = true;
  useRegMSG = 'Instance User Registration';
  userID: any
  selectInstanceID: any;
  assignRoleID: any;
  isShowPopup: boolean = false;
  dataRecord: any;
  disbaleButton: boolean = false
  assignlevelDataArr: any = []
  isLoading: boolean = false;
  error: boolean = false;


  totalCount: number = 0;
  pageNumber: number = 0;
  payLoadsViewUser: any;
  printDataSource: any;
  pdfOpen: boolean = false;
  public config = Common.config;
  timer: number = Common.timeout;
  searchValue: string = ''

  breadcrums = {
    heading: ' Manage User',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage User' },
      { link: 'Instance User Registration', current: true },
    ],
  };
  isGenerating: boolean = false
  public scroll = Common.scroll
  updating: boolean = false
  isViewClick: boolean = false;
  constructor(private dataservice: DataService, private _changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder, public print: NgxPrintElementService, private manageUserService: ManageUserService,
    private _ExcelService: ExcelService, private toast: ToastService) {
    this.childUserRegistrationForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(this.emailRegxVal)]),
      mobile: new FormControl('', [Validators.required, Validators.minLength(10)]),
      selectInstance: new FormControl(null, [Validators.required]),
      assignLevel: new FormControl(null, [Validators.required]),
      assignRole: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
    });
    this.childUserRegistrationForm.controls['status'].setValue(this.default);
    this.createdById = (sessionStorage.getItem("userId"));
  }


  ngOnInit() {
    this.toast.dismissSnackBar()
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };

    this.viewUserReport('page', this.payLoadsViewUser);
    // this.viewUserReport();
    this.userDetails = (sessionStorage.getItem("userDetails"));
    let resJSON = JSON.parse(this.userDetails);
    this.levelId = resJSON?.levelId
    this.assignLevel();
    this.instance();
    this.assignRoleSection();
  }

  viewUserReport(type: string, paylodas: any) {
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];

    paylodas['search'] = this.searchValue

    let resJSON = JSON.parse(sessionStorage.getItem("userDetails") as any);
    let data = { "loggedInUserId": resJSON?.uid, "childInstance": true };

    this.manageUserService.viewUsers(paylodas, data).subscribe(
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
        } else {

          this.isLoading = false;
          this.isGenerating = false
        }
      },
      (error) => {
        this.isLoading = false;
        this.isGenerating = false

        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
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




  // applyFilter(filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  //   this.pageNumber = 0
  //   let payloads = {
  //     pageNo: 0,
  //     sortOrder: 'desc',
  //     search:this.searchValue.toLowerCase(),
  //   };
  //   this.viewUserReport('page', payloads);
  // }

  //**********************************  ASSIGN LEVEL SELECTION ***********************************
  assignLevel() {
    let message;
    let obj = {
      'id': this.levelId
    }
    this.dataservice.instanceUserAssignLevel(obj).subscribe((res: any) => {
      let resSTR = JSON.stringify(res);
      let resJSON = res;
      if (resJSON.success) {
        this.levelDataSource = resJSON?.result.filter((res: any) => res.status);
        this.levelDataArr = this.levelDataSource
      } else {

        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {

      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }
  //******************************  INSTANCE SELECTION ************************************** */
  instance() {
    let message
    let obj = {
      "withSchool": true,
      "isDropDown": true
    }
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: '',
    };


    this.manageUserService.viewInstances(payloads, obj).subscribe((res: any) => {
      let resSTR = JSON.stringify(res);
      let resJSON = res
      if (resJSON.status) {
        this.instanceDataSource = resJSON?.instances?.result;
        this.instanceDataSource.forEach(element => {
          this.instanceRecordArr.push(element)
        });
      } else {

        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
      this.assignRole();
    }, (error) => {

      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  //***********************************  ASSIGN ROLE *************************************** */
  assignRole() {
    let message;
    this.dataservice.addRoleMasterView().subscribe((res: any) => {
      let resSTR = JSON.stringify(res);
      let resJSON = res
      if (resJSON.success) {
        this.roleDataSource = resJSON?.result;
        // this.roleDataSource.forEach(element => {
        //   this.roleDataArr.push(element)
        // });
      } else {

        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')

      }
    }, (error) => {

      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  //****************************************** ASSIGN ROLE FOR DELETE FOR LEVELID *********************** */
  assignRoleSection() {
    this.assignlevelDataArr = []
    let message;
    let obj = {
      "isDropDown": "d"
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.status == true) {
        this.levelDataSource = resJSON?.result;
        this.levelDataSource.forEach((item) => {
          this.assignlevelDataArr.push(item)
        })
      } else {

        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {

      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  onSelectAssignLevel(data) {
    this.childUserRegistrationForm.patchValue({
      selectInstance: null,
      assignRole: null
    })
    this.instanceDataArr = [];
    this.roleDataArr = []
    this.assignLevelID = data?.id;
    if (data == undefined) {
      return
    }
    this.getInstanceData(data?.id)
    this.getRoleData(data)
    this.childUserRegistrationForm.controls['selectInstance'].reset();
    this.childUserRegistrationForm.controls['assignRole'].reset();
  }
  getInstanceData(id: number) {
    let instance = structuredClone(this.instanceDataSource)
    this.instanceDataArr = instance.filter((res: any) => res?.levelId == id)
  }

  onSelectInstance(data) {
    this.selectInstanceID = data?.id
  }

  onSelectAssignRole(data) {
    this.assignRoleID = data?.id

  }
  getRoleData(data: any) {
    // let role = structuredClone(this.roleDataSource)
    // this.roleDataArr = role.filter((res: any) => res?.id == id && res.status)
    let str_Arr = [];
    str_Arr = data?.roleIds.split(',');
    str_Arr.forEach(element => {
      this.roleDataSource.forEach(item => {
        if (element == item?.id && item?.status) {
          this.roleDataArr.push(item)
        }
      });
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSubmit(action) {
    this.isSubmitted = true
    this.disbaleButton = true
    if (this.childUserRegistrationForm.invalid) {
      this.disbaleButton = false
      return
    } else {
      var statusValue, message
      if (this.childUserRegistrationForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }

      let data = {
        'name': this.childUserRegistrationForm.value.name.replace(/ {2,}/g, ' ').trim(),
        'username': this.childUserRegistrationForm.value.username.toLowerCase().replace(/ {2,}/g, ' ').trim(),
        'email': this.childUserRegistrationForm.value.email.replace(/ {2,}/g, ' ').trim(),
        'mobileNo': parseInt(this.childUserRegistrationForm.value.mobile),
        'levelId': this.assignLevelID,
        'instanceId': this.selectInstanceID,
        'roleId': this.assignRoleID,
        "loggedInUserId": parseInt(this.createdById),
        'status': statusValue
      }
      if (action == 'save') {
        this.dataservice.createUser(data).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false
          if (resJSON.success == true) {
            this.instanceDataArr = [];
            this.roleDataArr = [];
            this.pageNumber = 0
            this.toast.showMessage('You have successfully saved the data', '', 'success')
            let payloads = {
              pageNo: 0,
              sortOrder: 'desc',
              search: '',
            };
            this.viewUserReport('page', payloads)
            this.disbaleButton = false
            this.childUserRegistrationForm.reset();
            this.childUserRegistrationForm.controls['status'].setValue(this.default);
          }
          else {
            this.disbaleButton = false
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.disbaleButton = false

          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      }
      if (action == 'update') {
        data['id'] = this.userID
        this.dataservice.updateUser(data).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false
          if (resJSON.success == true) {
            this.instanceDataArr = [];
            this.roleDataArr = [];
            this.isShowButton = true;
            this.disbaleButton = false
            this.searchValue = ''
            this.useRegMSG = 'Instance User Registration'
            this.pageNumber = 0
            this.toast.showMessage('You have successfully updated the data', '', 'success')
            let payloads = {
              pageNo: 0,
              sortOrder: 'desc',
              search: '',
            };
            this.viewUserReport('page', payloads)
            this.childUserRegistrationForm.reset();
            this.childUserRegistrationForm.controls['status'].setValue(this.default);
          }
          else {
            this.disbaleButton = false
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.disbaleButton = false
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      }
    }
  }
  onCancle() {
    this.instanceDataArr = [];
    this.roleDataArr = [];
    this.isSubmitted = false
    this.useRegMSG = 'Instance User Registration'
    this.isShowButton = true;
    this.isViewClick = false;
    this.childUserRegistrationForm.reset();
    this.childUserRegistrationForm.enable();
    this.childUserRegistrationForm.controls['status'].setValue(this.default);
  }

  edit(object, button: string) {
    if (button == "edit") {
      this.useRegMSG = 'Edit Instance User'
      this.isViewClick = false;
      this.childUserRegistrationForm.enable();
    } else {
      this.useRegMSG = 'View Instance User'
      this.isViewClick = true;
      this.childUserRegistrationForm.disable();
    }
    this.userID = object?.uid
    let focus, statusValue
    this.isShowButton = false;
    if (object?.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }
    this.childUserRegistrationForm.patchValue({
      'name': object?.name, 'username': object?.userName, 'email': object?.emailId,
      'mobile': object?.number, 'selectInstance': object?.instance, 'assignLevel': object?.level, 'assignRole': object?.role, 'status': statusValue
    })  // multiple field set
    focus = document.getElementById('focusForm')
    focus.scrollIntoView()
    this.getInstanceData(object?.levelId)

    //get multiple data to assign role
    let levelData = []
    levelData = this.levelDataArr?.filter((item: any) => item?.id == object?.levelId)
    this.getRoleData(levelData[0]);

    this.selectInstanceID = object?.instanceId
    this.assignLevelID = object?.levelId
    this.assignRoleID = object?.roleId
    // this.assignlevelDataArr.forEach(element => {
    //   if(element?.level_name == object?.level){
    //      this.assignLevelID = element?.id
    //    }
    //  });
    // this.roleDataArr.forEach(element => {
    //   if(element?.name == object?.role ){
    //     this.assignRoleID = element?.id
    //   }
    // });
  }

  remove(object: any) {
    this.isShowPopup = true
    this.dataRecord = object
  }

  removeRecord(item) {

    if (item) {
      this.isGenerating = true
      this.instanceRecordArr.forEach(element => {
        if (element?.instance == this.dataRecord?.instance) {
          this.selectInstanceID = element?.id
        }
      });
      this.assignlevelDataArr.forEach(element => {
        if (element?.level_name == this.dataRecord?.level) {
          this.assignLevelID = element?.id
        }
      });
      this.roleDataArr.forEach(element => {
        if (element?.name == this.dataRecord?.role) {
          this.assignRoleID = element?.id
        }
      });

      let data = {
        'id': this.dataRecord?.uid,
        'name': this.dataRecord?.name,
        'username': this.dataRecord?.userName.toLowerCase(),
        'email': this.dataRecord?.emailId,
        'mobileNo': parseInt(this.dataRecord?.number),
        'levelId': this.assignLevelID,
        'instanceId': this.selectInstanceID,
        'roleId': this.assignRoleID,
        "loggedInUserId": parseInt(this.createdById),
        'status': this.dataRecord?.status
      }
      this.dataservice.deleteUser(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success == true) {
          this.isShowPopup = false
          let payloads = {
            pageNo: 0,
            sortOrder: 'desc',
            search: '',
          };
          this.viewUserReport('page', payloads)
          this.isGenerating = false
          // this.displayStyle = "none";
          // For the Form Reset
          this.useRegMSG = 'Instance User Registration'
          this.isViewClick = false;
          this.isShowButton = true;
          this.childUserRegistrationForm.reset();
          this.childUserRegistrationForm.enable();
          this.childUserRegistrationForm.controls['status'].setValue(this.default);
        }
        else {
          this.isShowPopup = false
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          this.isGenerating = false
        }
      }, (error) => {
        this.isGenerating = false
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isGenerating = false
      this.isShowPopup = false
    }
  }


  differentPass(event: any) {
    if (this.childUserRegistrationForm.get('username')?.value == event?.target?.value) {
      this.error = true
    }
    else {
      this.error = false
    }
  }

}
