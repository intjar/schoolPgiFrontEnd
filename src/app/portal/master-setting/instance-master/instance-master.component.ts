import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ManageUserService } from 'src/app/services/manage-user.service';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ToastService } from 'src/app/services/toast';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-instance-master',
  templateUrl: './instance-master.component.html',
  styleUrls: ['./instance-master.component.scss']
})
export class InstanceMasterComponent {

  displayedColumns = ['sn', 'instance', 'level', 'parentLevel', 'parentInstance', 'instanceCode', 'status', 'action'];
  displayedColumnsForUploadExcelModal = ['sn', 'instance', 'level', 'parentLevel', 'parentInstance', 'instanceCode', 'status', 'Errors'];
  dataSource = new MatTableDataSource<any>();

  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }

  @ViewChild(MatPaginator) viewtable: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChild('file') file!: ElementRef;

  instanceForm: FormGroup;

  dataSourceInstance: Array<any> = [];
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  parentLevelArr: any = [];
  parentInstanceArr: any = [];
  instanceLevelArr: any = [];
  isShowButton: boolean = true;
  displayStyle = "none";
  isVisible: boolean = false;
  msg: string;
  instanceMSG = "Manage Instance"
  parentlevel;
  parentInstanceID;
  instanceLevelID;
  isshowInstance: boolean;
  isshowparentInstance: boolean
  isSubmitted: boolean = false;
  createdById;
  parentArr: any = []
  instancelevel: any = [];
  isShowPopup: boolean = false;
  editInstanceID;
  editInstance;
  instanceDelete;
  instanceMasterData: any = []
  levelMasterData: any = []
  instancelevelMasterData: any = []
  updating: boolean = false;
  isLoading: boolean = false;
  isLoader: boolean = false;
  searchFilter: string = "";
  searchValue: string = ''
  pageNumber: number = 0;
  totalCount: number = 0;
  isGenerating: boolean = false;
  printDataSource: any;
  pdfOpen: boolean = false;
  public config = Common.config;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'Master Setting', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Instance Master', current: true }
    ]
  }
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
  
  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private _ExcelService: ExcelService,
    private _changeDetectorRef: ChangeDetectorRef,
    private manageUserService: ManageUserService,
    public print: NgxPrintElementService,
    private toast: ToastService) {
    this.instanceForm = this.formBuilder.group({
      parentLevel: new FormControl(null, [Validators.required]),
      parentInstance: new FormControl(null, [Validators.required]),
      instanceLevel: new FormControl(null, [Validators.required]),
      instanceName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      code: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)]),
      status: new FormControl(null, [Validators.required])
    })
    this.instanceForm.controls['status'].setValue(this.default)
    this.createdById = (sessionStorage.getItem("userId"));
  }
  ID: number = -1;
  payLoadsViewUser: any;
  public scroll = Common.scroll
  ngOnInit() {
    this.toast.dismissSnackBar();
    this.instanceMasterReport('table')
    this.instanceMasterReport('drop')
    this.payLoadsViewUser = {
      pageNo: this.pageNumber,
      sortOrder: 'desc',
      search: '',
    };
    //this.viewUserReport('page', this.payLoadsViewUser);

  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  onChangeParentLevel(val) {
    this.isSubmitted = false
    this.instanceForm.patchValue({
      parentInstance: null,
      instanceLevel: null
    });
    this.parentlevel = val?.levelId
    this.instanceLevelArr = []
    this.parentInstanceArr = []
    let levelMaster = this.instancelevelMasterData
    let instanceMaster = this.instanceMasterData
    this.parentInstanceArr = instanceMaster?.instances?.result.filter((res: any) => {
      return res?.levelId == val?.id && res?.status == true
    })

    this.instanceLevelArr = levelMaster?.filter((res: any) => {
      return res?.parent_level_id == val?.id && res?.status == true
    })

  }


  onChangeParentInstance(val) {
    this.isshowparentInstance = true;
    if (val == null) {
      return
    } else {
      this.parentInstanceID = val?.id
    }
  }
  onChangeInstanceLevel(val) {

    this.editInstanceID = val?.id
    if (val == null) {
      return
    } else {
      this.instanceLevelID = val?.id
    }
  }

  onSubmit(action) {
    this.isSubmitted = true
    let message
    if (this.instanceForm?.invalid) {
      return
    } else {
      this.updating = true;
      var statusValue
      if (this.instanceForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      let data = {
        'parentInstanceId': this.parentInstanceID,
        'levelId': this.instanceLevelID,
        'instanceName': this.instanceForm.value.instanceName.replace(/ {2,}/g, ' ').trim(),
        'instanceCode': parseInt(this.instanceForm.value.code),
        'status': statusValue,
        "loggedInUserId": parseInt(this.createdById)
      }
      if (action == 'Save') {
        this.dataService.addInstanceMaster(data).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false;
          if (resJSON?.success) {
            this.parentInstanceArr = [];
            this.instanceLevelArr = []
            this.updating = false;
            this.toast.showMessage('You have successfully saved the data', '', 'success');
            this.instanceMasterReport('table');
            this.instanceMasterReport('drop');
            this.instanceForm.reset()
            this.instanceForm.controls['status'].setValue(this.default);
            this.searchFilter = "";
          }
          else {
            this.updating = false;
            this.isSubmitted = false;
            this.isShowButton = true
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.updating = false;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      }

      if (action == 'Update') {
        data['id'] = this.ID,
          this.dataService.instanceMasterUpdate(data).subscribe(res => {
            let resSTR = JSON.stringify(res);
            let resJSON = JSON.parse(resSTR);
            this.isSubmitted = false;
            if (resJSON?.success) {
              this.parentInstanceArr = [];
              this.instanceLevelArr = []
              this.updating = false;
              this.isShowButton = true;
              this.toast.showMessage('You have successfully updated the data', '', 'success')
              this.instanceMasterReport('table');
              this.instanceMasterReport('drop');
              this.instanceForm.reset()
              this.instanceForm.controls['status'].setValue(this.default);
              this.instanceMSG = "Manage Instance"
              this.searchFilter = "";
            }
            else {
              this.updating = false;
              this.isShowButton = false
              this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
            }
          }, (error) => {
            this.updating = false;
            this.toast.showMessage('Something went wrong!', '', 'unsuccess')
          })
      }
    }
  }


  onClear() {
    this.parentInstanceArr = [];
    this.instanceLevelArr = []
    this.isShowButton = true;
    this.isSubmitted = false;
    this.isViewClick = false;
    this.instanceMSG = "Manage Instance";
    this.instanceForm.reset()
    this.instanceForm.enable()
    this.instanceForm.controls['status'].setValue(this.default);
  }

  viewUserReport(type: string, paylodas: any) {

    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : this.isGenerating = true;
    this.printDataSource = [];

    paylodas['search'] = this.searchValue

    let resJSON = JSON.parse(sessionStorage.getItem("userDetails") as any);
    // let data = {"loggedInUserId":resJSON?.uid,"childInstance":true};
    let data = {
      "withSchool": false,
      "isDropDown": false
    }
    this.manageUserService.viewInstances(paylodas, data).subscribe(
      (res: any) => {
        let resJSON = res;
        if (resJSON?.status) {
          let dataSource = res?.instances?.result;
          this.printDataSource = structuredClone(dataSource);
          if (type === 'page') {
            (this.dataSource = new MatTableDataSource<any>(dataSource)),
              (this.isLoading = false),
              (this.totalCount = resJSON?.instances.totalElements);
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
              'Instance Name',
              'Instance Level',
              'Parent Level',
              'Parent Instance',
              'Code',
              'Status',
            ];
            let itemData = structuredClone(this.printDataSource);
            itemData.forEach((element: any) => {
              element['Instance Name'] = element['instance'];
              element['Instance Level'] = element['level'];
              element['Parent Level'] = element['parentLevel'];
              element['Parent Instance'] = element['parentInstance'];
              element['Code'] = element['instanceCode'];
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
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          this.isLoading = false;
          this.isGenerating = false
        }
      },
      (error) => {
        this.isLoading = false;
        this.isGenerating = false
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );

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

  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: this.searchValue.toLowerCase(),
      size: this.totalCount,
    };
    this.viewUserReport(type, payLoads);
  }

  showAlert(data): void {
    if (this.isVisible) {
      return;
    }
    this.isVisible = true;
    this.msg = data
    setTimeout(() => this.isVisible = false, this.timer)
  }


  levelmasterReport() {
    let obj = {
      "isDropDown": "d"
    }
    this.dataService.addLevelMasterViewLevel(obj).subscribe((res: any) => {
      this.instancelevel = res
      let resJSON = res
      this.levelmasterReport1()
      this.parentArr = res?.result
      this.levelMasterData = []
      this.levelMasterData = res?.result?.filter((res: any) => {
        return res?.level_name != 'School' && res?.status
      })

      this.parentLevelArr = []
      let preParentLevelArr: any = []
    }, (error) => {

      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    });
    // })
  }

  levelmasterReport1() {
    let obj = {
      "isDropDown": null
    }
    this.dataService.addLevelMasterViewLevel(obj).subscribe((res: any) => {
      this.instancelevel = res
      let resJSON = res
      this.instancelevelMasterData = res?.result

      this.parentLevelArr = []
      let preParentLevelArr: any = []
      this.parentLevelArr = preParentLevelArr.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.levelId === value.levelId,
          )
      );
    }, (error) => {
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    });
    // })
  }

  instanceMasterReport(type: string) {
    this.isLoading = true;
    this.pageNumber = 0
    let obj = {
      "withSchool": false,
      "isDropDown": type == 'table' ? false : true
    }
    let payloads = {
      pageNo: 0,
      sortOrder: 'desc',
      search: '',
    };
    this.manageUserService.viewInstances(payloads, obj).subscribe((res: any) => {
      // this.PIArray = res
      if (res?.status) {
        if (type == 'table') {
          this.dataSourceInstance = res?.instances?.result;

          this.dataSource = new MatTableDataSource<any>(this.dataSourceInstance);
          this.totalCount = res?.instances?.totalElements;
          this.sortData();
        } else {
          this.instanceMasterData = res
          this.levelmasterReport();
        }



      }
      else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  edit(object: any, button: string) {
    // this.isLoader = true;
    if (button == "edit") {
      this.instanceMSG = "Edit Instance"
      this.isViewClick = false;
      this.instanceForm.enable();
    } else {
      this.instanceMSG = "View Instance"
      this.isViewClick = true;
      this.instanceForm.disable();
    }
    let focus, statusValue

    this.isshowparentInstance = true;
    this.isshowInstance = true;
    this.instanceLevelID = object?.levelId;
    this.parentInstanceID = object?.parentInstanceId
    this.isShowButton = false;
    this.ID = object?.id
    if (object?.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }

    let items = {
      id: object?.parentLevelId,
    }
    this.onChangeParentLevel(items)
    this.instanceForm.patchValue({
      'parentLevel': object?.parentLevel,
      'parentInstance': object?.parentInstance,
      'instanceLevel': object?.level,
      'instanceName': object?.instance,
      'code': object?.instanceCode,
      'status': statusValue
    })  // multiple field set
    // focus = document.getElementById("focusForm");
    // focus.scrollIntoView();
    this.isLoader = false;
  }

  remove(object: any) {
    this.instanceDelete = object
    this.isShowPopup = true
  }

  removeRecord(item) {
    if (item) {
      let message;
      let obj = {
        "id": this.instanceDelete?.id,
        "parentInstanceId": this.instanceDelete?.parentInstanceId,
        "levelId": this.instanceDelete?.levelId,
        "instanceName": this.instanceDelete?.instance,
        "instanceCode": this.instanceDelete?.instanceCode,
        "status": this.instanceDelete?.status,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataService.instanceDelete(obj).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success) {
          this.isShowPopup = false
          this.onClear()
          this.instanceMasterReport('table');
        } else {
          this.isShowPopup = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isShowPopup = false
    }
  }



  downloadUserFormat(){
    //the template file in your assets folder
    const fileUrl = 'assets/download-format/instance-master.xlsx';
  
    // Download the file using FileSaver.js
    FileSaver.saveAs(fileUrl, 'instance-master.xlsx');
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
        instance : 'Himachal Pradesh',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 11,
        status : true,
        error : ''
      },
      {
        instance : 'Bihar',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 14,
        status : true,
        error : 'Existing Instance'
      },
      {
        instance : 'Uttarakhand',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 19,
        status : true,
        error : 'Existing Instance'
      },
      {
        instance : 'Assam',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 15,
        status : true,
        error : ''
      },
      {
        instance : 'Punjab',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 18,
        status : true,
        error : ''
      },
      {
        instance : 'Rajasthan',
        level : 'state',
        parentLevel : 'National',
        parentInstance : 'India',
        instanceCode : 12,
        status : true,
        error : 'Existing Instance'
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

}
