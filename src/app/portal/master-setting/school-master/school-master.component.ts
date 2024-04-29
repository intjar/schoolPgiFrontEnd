import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { MasterSettingService } from 'src/app/services/master-setting.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-school-master',
  templateUrl: './school-master.component.html',
  styleUrls: ['./school-master.component.scss'],
})
export class SchoolMasterComponent implements OnInit {
  displayedColumns = [
    'sn',
    'school',
    'instance',
    'code',
    'udise',
    'status',
    'action',
  ];
  dataSource: any = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  schoolForm: FormGroup;
  blockinstanceNameArr: any = [];
  blockinstanceLevelID;
  blockLevelArr: any = [];
  blockLevel;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  code;
  blocklevelID;
  ID: number = -1;
  isShowButton: boolean = true;
  isVisible: boolean = false;
  msg: string;
  displayStyle = 'none';
  isSubmitted: boolean = false;
  schoolMSG = 'Manage School';
  createdById;
  editFieldData;
  schoolDelete: any;
  isShowPopup: boolean = false;
  instanceID: any;
  instanceLevelArr: any = [];
  iD: any;
  levelInstance: any = [];
  editID: any;
  instanceMasterID: any;
  block: any;
  levelMaster: any;
  udiseCode: any;
  deleteInstanceMaster: any;
  updating: boolean = false;
  isLoading: boolean = false;
  viewLevel: any;
  viewBlockLevel: any;
  dataSourceSchool: any;
  viewSchoolName: any;
  viewUDISEcode: any;
  viewStatus: any;
  printPage: any = Common;
  pdfOpen: boolean = false;
  blockInstanceLevel: any
  public config = Common.config;
  public scroll = Common.scroll;
  timer: number = Common.timeout;
  level: any;
  instanceArray: any = [];
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'School Master', current: true },
    ],
  };
  isGenerating: boolean = false;
  totalCount: number = 0;
  pageNumber: number = 0;
  basicSchoolPayloads: any;
  searchValue: string = '';
  schoolAlldata: any;
  isViewClick: boolean = false;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private masterSettingService: MasterSettingService,
    private toast: ToastService
  ) {
    this.schoolForm = this.formBuilder.group({
      blockLevel: new FormControl(null, [Validators.required]),
      blockinstanceLevel: new FormControl(null, [Validators.required]),
      schoolName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      UDISECode: new FormControl('', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ]),
      Status: new FormControl(null, [Validators.required]),
    });
    this.schoolForm.controls['Status'].setValue(this.default);
    this.createdById = sessionStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.toast.dismissSnackBar()
    this.basicSchoolPayloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: '',
    };

    this.schoolmasterReport('page', this.basicSchoolPayloads);
    this.viewblockLevel();
  }

  onSelectLevel(val) {
    this.schoolForm.patchValue({
      blockinstanceLevel: null,
    });
    this.level = val?.id;
    this.blockLevel = val?.level_name;
    this.instanceID = val?.id;

    this.instanceLevelArr = [];
    let obj = {
      listIds: [val?.id],
    };

    this.dataService.viewblocklevelInstance(obj).subscribe(
      (res: any) => {
        if (res?.success == true) {
          res?.result?.forEach((element) => {
            if (this.instanceID == element?.level && element?.status) {
              this.instanceLevelArr?.push(element);
            }
          });
        } else {
          if (res?.result?.length > 0) {
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
        }
      },
      (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );

    // if(val?.level == null){
    // if(flag != 1){
    //   let data ={
    //     instanceName : 'NA',
    //     id : 0
    //   }
    //   this.instanceLevelArr.push(data)
    // }
    // else{
    //   this.blockLevelArr.forEach(element => {
    //     if(val?.id == element?.level){
    //       flag = 1
    //       this.instanceLevelArr.push(element)
    //     }
    //   });
    // }
  }

  onselectInstance(val) {
    this.blocklevelID = val?.id;
    // this.blockinstanceLevelID = val?.instanceName
    // this.code = val?.instanceCode
  }

  onSubmit(action) {
    this.isSubmitted = true;

    if (this.schoolForm.invalid) {
      return;
    } else {
      this.updating = true;
      var statusValue;
      if (this.schoolForm.value.Status == 'Active') {
        statusValue = 1;
      } else {
        statusValue = 0;
      }
    }
    // if (action == 'Save') {
    //   message = 'You have successfully saved the data'
    //   this.editFieldData = undefined
    // }
    // else if (action == 'Update') {
    //   message = "You have successfully updated the data"
    // }
    let data = {
      schoolName: this.schoolForm.value.schoolName,
      udiseCode: this.schoolForm.value.UDISECode,
      status: statusValue,
      blockLevelInstanceId: this.blocklevelID,
      levelMaster: {
        id: this.level,
      },
      loggedInUserId: parseInt(this.createdById),
    };

    if (action == 'save') {
      this.dataService.createschoolMaster(data).subscribe(
        (res: any) => {
          this.isSubmitted = false;
          if (res?.success) {
            this.instanceLevelArr = []
            this.updating = false;
            this.isShowButton = true;
            this.isSubmitted = false;
            this.pageNumber = 0
            this.toast.showMessage('You have successfully saved the data', '', 'success');
            this.schoolmasterReport('page', this.basicSchoolPayloads);
            this.schoolForm.reset();
            this.schoolForm.controls['Status'].setValue(this.default);
            this.schoolMSG = 'Manage School';
          } else {
            this.updating = false;
            this.isSubmitted = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
        },
        (error) => {
          this.updating = false;
          this.isSubmitted = false;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        }
      );
    }

    if (action == 'update') {
      let data = {
        id: this.editID,
        schoolName: this.schoolForm.value.schoolName,
        udiseCode: this.schoolForm.value.UDISECode,
        status: statusValue,
        blockLevelInstanceId: this.blockInstanceLevel,
        instanceMaster: {
          id: this.instanceMasterID,
        },
        levelMaster: {
          id: this.level,
        },
        loggedInUserId: parseInt(this.createdById),
      };
      this.dataService.createschoolMaster(data).subscribe(
        (res: any) => {
          this.isSubmitted = false;
          if (res?.success) {

            this.updating = false;
            this.pageNumber = 0
            this.isShowButton = true;
            this.toast.showMessage('You have successfully updated the data', '', 'success');
            this.schoolmasterReport('page', this.basicSchoolPayloads);
            this.schoolForm.reset();
            this.schoolForm.controls['Status'].setValue(this.default);
            this.schoolMSG = 'Manage School';
          } else {
            this.updating = false;
            this.isSubmitted = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
        },
        (error) => {
          this.updating = false;
          this.isSubmitted = false;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        }
      );
    }
  }

  viewblockLevel() {
    let obj = {
      "isDropDown": "d"
    }
    this.dataService.addLevelMasterViewLevel(obj).subscribe(
      (res: any) => {
        if (res?.status == true) {
          // res?.result.forEach((element) => {
          //   if (res?.level_name != 'School' && element?.status) {
          //     this.blockLevelArr.push(element);
          //   }
          // });
          this.blockLevelArr = res?.result?.filter((res: any) => {
            return res?.level_name != 'School' && res?.status
          })
        }
        else {
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  exportExcel() {
    this.isGenerating = true;
    const headers: any = [
      'Level',
      'BlockLevel',
      'SchoolName',
      'UDISEcode',
      'Status',
    ];
    let responseData = this.dataSourceSchool;

    responseData.forEach((element: any) => {
      element['Level'] = element?.levelMaster?.levelName;
      element['BlockLevel'] = element?.blockLevelInstanceMaster?.instanceName;
      element['SchoolName'] = element?.schoolMaster?.schoolName;
      element['UDISEcode'] = element?.schoolMaster?.udiseCode;
      element['Status'] =
        element?.schoolMaster?.status == 1 ? 'Active' : 'Inactive';
    });

    setTimeout(() => {
      this._ExcelService.downloadFile(responseData, 'school_master', headers);
      this.isGenerating = false;
    }, 1000);
  }

  schoolmasterReport(type: string, payloads: any) {
    this.isLoading = true;


    //this.dataSource = new MatTableDataSource<any>();
    this.masterSettingService.viewSchool(payloads, '').subscribe(
      (res: any) => {
        if (res?.success) {
          let allItems = res?.result?.result

          this.schoolAlldata = structuredClone(allItems)
          if (type === 'page') {
            this.levelInstance = res?.result?.result;
            this.dataSourceSchool = res?.result?.result
            this.dataSource = new MatTableDataSource<any>(this.dataSourceSchool);
            (this.isLoading = false),
              (this.totalCount = res?.result?.totalElements);
          }

          if (type == 'pdf') {
            this.pdfOpen = true;
            this.isGenerating = true;
            setTimeout(() => {
              this.print.print('print-pdf', this.config);
              // this.printPage.printPage()
              this.isGenerating = false;
              this.pdfOpen = false;
            }, 500);
          }


          if (type == 'csv') {
            this.isGenerating = true;
            const headers: any = [
              'School Name',
              'Instance Name',
              'Instance Code',
              'UDISE code',
              'Status',
            ];
            let responseData = structuredClone(this.schoolAlldata);

            responseData.forEach((element: any) => {
              element['School Name'] = element?.schoolMaster?.schoolName;
              element['Instance Name'] = element?.blockLevelInstanceMaster?.instanceName;
              element['Instance Code'] = element?.blockLevelInstanceMaster?.instanceCode;
              element['UDISE code'] = element?.schoolMaster?.udiseCode;
              element['Status'] =
                element?.schoolMaster?.status == 1 ? 'Active' : 'Inactive';
            });

            setTimeout(() => {
              this._ExcelService.downloadFile(responseData, 'school_master', headers);
              this.isGenerating = false;
            }, 1000);

          }

          this.isLoading = false;
        } else {
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }
  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;
    let payloads = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    payloads['search'] = this.searchValue.toLowerCase();
    this.dataSource = new MatTableDataSource<any>();
    this.schoolmasterReport('page', payloads);
    // this.payLoadsViewUser['pageNo'] = this.pageNumber;
    // this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
    // this.viewUserReport('page', this.payLoadsViewUser);
  }

  filterData(type: string) {
    this.pageNumber = 0;
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    type == 'clear' ? (this.searchValue = '') : '';

    this.schoolmasterReport('page', payloads);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data;
  //   setTimeout(() => (this.isVisible = false), this.timer);
  // }

  onClear() {
    this.instanceLevelArr = [];
    this.isSubmitted = false;
    this.isShowButton = true;
    this.isViewClick = false;
    this.schoolMSG = 'Manage School';
    this.schoolForm.reset();
    this.schoolForm.enable();
    this.schoolForm.controls['Status'].setValue(this.default);
  }

  edit(object: any, button: any) {
    if (button == "edit") {
      this.schoolMSG = 'Edit School';
      this.isViewClick = false;
      this.schoolForm.enable();
    } else {
      this.schoolMSG = 'View School';
      this.isViewClick = true;
      this.schoolForm.disable();
    }

    this.blockInstanceLevel = object?.blockLevelInstanceMaster.id
    this.viewLevel = object?.levelMaster.levelName;
    this.viewBlockLevel = object?.blockLevelInstanceMaster.instanceName;
    this.viewSchoolName = object?.schoolMaster.schoolName;
    this.viewUDISEcode = object?.schoolMaster.udiseCode;
    this.viewStatus = object?.schoolMaster.status;
    this.instanceLevelArr = [];
    this.levelMaster = object?.levelMaster.id;
    // this.block = object?.blockLevelInstanceMaster.id;
    this.editID = object?.schoolMaster.id;
    this.instanceMasterID = object?.instanceMaster.id;

    let focus, statusValue, blocklevelName;
    // this.editFieldData = object?.id
    this.isShowButton = false;

    this.blocklevelID = object?.instanceMaster?.id;
    this.blockLevel = object?.level_name;
    this.level = object?.levelMaster?.id;
    this.onSelectLevel(object?.levelMaster);
    this.blockinstanceLevelID = object?.instanceMaster?.instanceName;
    // if (object?.id == this.blockLevel) {
    //   this.blockLevel = object?.level_name;
    // }
    // this.blockLevelArr.forEach(element => {
    //   if (element?.level_name == object?.levelMaster.levelName) {
    //     blocklevelName = element?.level_name
    //   }
    // });

    if (object?.schoolMaster.status == 1) {
      statusValue = 'Active';
    } else {
      statusValue = 'Inactive';
    }
    setTimeout(() => {
      this.schoolForm.patchValue({
        blockLevel: object?.levelMaster.levelName, //blocklevelName,
        blockinstanceLevel: object?.blockLevelInstanceMaster.instanceName,
        schoolName: object?.schoolMaster.schoolName,
        UDISECode: object?.schoolMaster.udiseCode,
        Status: statusValue,
      });
    }, 500);
    // focus = document.getElementById("focusForm");
    // focus.scrollIntoView();
  }

  remove(object: any) {
    this.deleteInstanceMaster = object?.instanceMaster.id;
    this.schoolDelete = object?.schoolMaster.id;
    this.isShowPopup = true;
  }

  removeRecord(item) {
    if (item) {
      this.isGenerating = true;
      let obj = {
        id: this.schoolDelete,
        loggedInUserId: parseInt(this.createdById),
        instanceId: this.deleteInstanceMaster,
      };
      this.dataService.deleteschoolMaster(obj).subscribe(
        (res: any) => {
          if (res?.success) {
            this.isShowPopup = false;
            this.onClear()
            this.schoolmasterReport('page', this.basicSchoolPayloads);
            this.isGenerating = false;
          } else {
            this.isGenerating = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
        },
        (error) => {
          this.isShowPopup = false;
          this.isGenerating = false;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        }
      );
    } else {
      this.isGenerating = false;
      this.isShowPopup = false;
    }
  }

  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    // type == 'clear' ? this.searchValue = '' : '
    this.schoolmasterReport(type, payLoads);
  }

}
