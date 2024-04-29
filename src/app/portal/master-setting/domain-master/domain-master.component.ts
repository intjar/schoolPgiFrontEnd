import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { error } from 'jquery';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-domain-master',
  templateUrl: './domain-master.component.html',
  styleUrls: ['./domain-master.component.scss']
})
export class DomainMasterComponent {

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['sn', 'domainName', 'domainCode', 'subdomain', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('viewtable') set viewtable(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  SubdisplayedColumns = ['sn', 'domain', 'code', 'subDomainName', 'subDomainCode', 'status', 'action'];
  dataSourceManage = new MatTableDataSource<any>();
  @ViewChild('viewmanagetable') set viewmanagetable(value: MatPaginator) {
    this.dataSourceManage.paginator = value;
  }

  domainForm: FormGroup;
  subDomainForm: FormGroup;
  dtOptionsLevel: any;
  subDomainDataSource;
  isShowButton: boolean = true;
  isVisible: boolean = false;
  msg: string;
  domainMSG = "Manage Domain";
  subDomainMSG = "Manage Sub Domain";
  displayStyle = "none";
  statusValue: string[] = ['Active', 'Inactive'];
  parentLevelArr: any = [];
  domainArr: any = [];
  default: string = 'Active';
  ID: any;
  isshowdomainID: boolean;
  assignDomain;
  domainID;
  domain_name;
  isSubDomain: boolean = true;
  isSubmitted: boolean = false;
  subDomainId
  createdById;
  isShowPopup: boolean = false;
  pdfOpen: boolean = false
  public config = Common.config;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Domain Master', current: true },
    ],
  };
  subSearchFilter: string = "";
  searchFilter: string = "";
  isLoading: boolean = false
  isViewClick: boolean = false;
  isSubViewClick: boolean = false;
  public scroll = Common.scroll
  updating: boolean = false
  constructor(private dataservice: DataService,
    private formBuillder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService) {
    this.domainForm = this.formBuillder.group({
      domainname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      status: new FormControl(null, [Validators.required]),
      code: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)])
    })
    this.domainForm.controls['status'].setValue(this.default);

    this.subDomainForm = this.formBuillder.group({
      domainname: new FormControl('', [Validators.required]),
      subdomainname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      status: new FormControl(null, [Validators.required]),
      code: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)])
    })
    this.subDomainForm.controls['status'].setValue(this.default);
    this.createdById = (sessionStorage.getItem("userId"));

  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.manageDomainReport();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  sortSubData() {
    this.dataSourceManage.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  onSelectChange(data) {
    this.domainID = data.id
    this.domain_name = data
    this.isshowdomainID = false
    this.manageSubDomainReport(data)
  }

  onSubmit(action) {
    this.updating = true
    this.isSubmitted = true;
    let message
    if (this.domainForm.invalid) {
      this.updating = false
      return
    } else {
      var statusValue
      if (this.domainForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      if (action == 'save') {
        this.ID = undefined
        message = 'You have successfully saved the data'
      }
      else if (action == 'update') {
        message = "You have successfully updated the data"
      }
      let data = {
        'id': this.ID,
        'domainName': this.domainForm.value.domainname.replace(/ {2,}/g, ' ').trim(),
        'domainCode': parseInt(this.domainForm.value.code),
        'status': statusValue,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataservice.addCreateManageDomain(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmitted = false;
        if (resJSON.success == true) {
          this.domainMSG = "Manage Domain"
          this.isShowButton = true;
          this.toast.showMessage(message, '', 'success');
          this.manageDomainReport();
          this.domainForm.reset();
          this.domainForm.controls['status'].setValue(this.default);
          this.searchFilter = "";
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

  onCancel() {
    this.isViewClick = false;
    this.domainMSG = "Manage Domain"
    this.domainForm.reset();
    this.domainForm.enable();
    this.domainForm.controls['status'].setValue(this.default);
    this.isShowButton = true;

    this.isSubViewClick = false;
    this.subDomainMSG = "Manage Sub Domain"
    this.subDomainForm.reset();
    this.subDomainForm.enable();
    this.subDomainForm.controls['status'].setValue(this.default);
  }

  backButtonClick() {
    this.isViewClick = false;
    this.isSubViewClick = false;
    this.isShowButton = true;
    this.domainForm.reset();
    this.domainForm.enable()
    this.domainMSG = "Manage Domain";
    this.domainForm.controls['status'].setValue(this.default);
    this.subDomainForm.reset();
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

  subDomain() {

    this.subDomainForm.controls['status'].setValue(this.default);
  }

  manageDomainReport() {
    this.isLoading = true
    this.dataSource = new MatTableDataSource<any>();
    this.dataservice.addManageDomainViewLevel().subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON.success) {
        let dataSource = resJSON?.result;
        this.domainArr = dataSource
        this.dataSource = new MatTableDataSource<any>(dataSource);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort
        this.isLoading = false;
        this.sortData();
      } else {
        this.isLoading = false
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
      }
    }, (error) => {
      this.isLoading = false
      this.toast.showMessage('Something went wrong!', '', 'unsuccess');
    })
  }

  edit(object: any, button: any) {
    if (button == "edit") {
      this.domainMSG = 'Edit Domain';
      this.isViewClick = false;
      this.domainForm.enable();
    } else {
      this.domainMSG = 'View Domain';
      this.isViewClick = true;
      this.domainForm.disable();
    }

    let focus, statusValue
    this.isShowButton = false;
    this.ID = object?.id
    if (object?.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }
    this.domainForm.patchValue({ 'domainname': object?.domainName, 'code': object?.domainCode, 'status': statusValue })
    focus = document.getElementById("focusForm");
    focus.scrollIntoView();
  }

  remove(object: any) {
    this.isShowPopup = true
    this.ID = object
  }

  removeRecord(item) {
    let message
    if (item) {
      let obj = {
        'id': this.ID?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      if (this.isSubDomain) {
        this.dataservice.addDeleteManageDomain(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.isShowPopup = false
            this.onCancel()
            this.manageDomainReport();
          } else {
            this.isShowPopup = false;
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })
      } else {
        this.dataservice.addDeleteManageSubDomain(obj).subscribe(res => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON.success == true) {
            this.isShowPopup = false
            this.onCancel()
            this.manageSubDomainReport(this.ID?.domainMaster);
          } else {
            this.isShowPopup = false;
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

  closePopup() {
    this.displayStyle = "none";
  }

  applyFilter(event: any, action: string) {
    let filterValue = action == 'subdomain' ? this.subSearchFilter : this.searchFilter;
    if (action == 'domain') {
      if (filterValue.length > 0) {
        let roleFilters = this.domainArr?.filter((x: any) => {
          return (
            (
              (x?.domainName
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
              (x?.domainCode?.toString()
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1))
          );
        });
        this.dataSource = new MatTableDataSource<any>(roleFilters);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      } else {
        this.dataSource = new MatTableDataSource<any>(this.domainArr);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      }
    }
    else if (action == 'subdomain') {
      if (filterValue.length > 0) {
        let roleFilters = this.subDomainDataSourceArr?.filter((x: any) => {
          return (
            (
              (x?.subDomainName
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
              (x?.subDomainCode?.toString()
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
              (x?.domainMaster?.domainName?.toString()
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
              (x?.domainMaster?.domainCode?.toString()
                ?.toLocaleLowerCase()
                .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1))
          );
        });
        this.dataSourceManage = new MatTableDataSource<any>(roleFilters);
        this.dataSourceManage.paginator = this.viewtable;
        this.dataSourceManage.sort = this.sort;
        this.sortSubData();
      } else {
        this.dataSourceManage = new MatTableDataSource<any>(this.subDomainDataSourceArr);
        this.dataSourceManage.paginator = this.viewtable;
        this.dataSourceManage.sort = this.sort;
        this.sortSubData();
      }
    }

  }
  // <--------------------------------- Manage Sub Domain ------------------------------------>

  subDomainDataSourceArr: any = []
  manageSubDomainReport(item) {
    this.dataSourceManage = new MatTableDataSource<any>();
    this.subDomainDataSourceArr = []
    this.domain_name = item;
    this.domainID = item?.id;
    this.assignDomain = item?.domainName
    this.isSubDomain = false
    this.isLoading = true
    let message;
    this.dataservice.addManageSubDomainViewLevel().subscribe(res => {
      let resSTR = JSON.stringify(res);
      let resJSON: any = res

      if (resJSON.success) {
        this.subDomainDataSource = resJSON?.result;
        this.subDomainDataSource.forEach(element => {
          if (element?.domainMaster?.domainName == item?.domainName) {
            return this.subDomainDataSourceArr.push(element)
          }
        });
        this.isLoading = false
        this.dataSourceManage = new MatTableDataSource<any>(this.subDomainDataSourceArr);
        this.dataSourceManage.paginator = this.viewmanagetable;
        this.dataSourceManage.sort = this.sort;
        this.sortSubData();
      } else {
        this.isLoading = false
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
      }
    }, (error) => {
      this.isLoading = false
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  onSubmitSubDomain(action) {
    this.updating = true
    this.isSubmitted = true;
    let message, statusValue
    if (this.subDomainForm.invalid) {
      this.updating = false
      return
    }
    else {
      if (this.subDomainForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      if (action == 'save') {
        message = 'You have successfully saved the data';
        this.subDomainId = undefined
      }
      else if (action == 'update') {
        message = "You have successfully updated the data"
      }
      var data = {
        'id': this.subDomainId,
        "subDomainName": this.subDomainForm.value.subdomainname.replace(/ {2,}/g, ' ').trim(),
        "subDomainCode": parseInt(this.subDomainForm.value.code),
        "status": statusValue,
        "domainMaster": {
          "id": this.domainID
        },
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataservice.addCreateManageSubDomain(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmitted = false;
        if (resJSON.success == true) {
          this.subDomainMSG = "Manage Sub Domain"
          this.isShowButton = true;
          this.toast.showMessage(message, '', 'success');
          this.manageSubDomainReport(this.domain_name);
          this.subDomainForm.controls['subdomainname'].reset();
          this.subDomainForm.controls['code'].reset();
          this.subDomainForm.controls['status'].setValue(this.default);
          this.subSearchFilter = "";
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
  // isViewClicks: boolean = false
  editSubDomain(object: any, button: any) {
    if (button == "subedit") {
      this.subDomainMSG = 'Edit Sub Domain';
      this.isSubViewClick = false;
      this.subDomainForm.enable();
    } else {
      this.subDomainMSG = 'View Sub Domain';
      this.isSubViewClick = true;
      this.subDomainForm.disable();
    }

    this.domain_name = object?.domainMaster
    this.domainArr.forEach(element => {
      if (element.domainName == object?.domainMaster?.domainName)
        this.domainID = element?.id
    });
    this.subDomainId = object?.id

    let focus
    this.isShowButton = false;
    var statusValue
    if (object?.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }

    // multiple field set
    this.subDomainForm.patchValue({
      'domainname': object?.domainMaster?.domainName,
      'subdomainname': object?.subDomainName,
      'code': object?.subDomainCode,
      'status': statusValue
    })

    focus = document.getElementById("focusForm");
    focus.scrollIntoView();
  }
  printPDF() {
    this.pdfOpen = true;
    setTimeout(() => {
      this.print.print('print-pdf', this.config);
      // this.printPage.printPage()
      this.pdfOpen = false
    }, 500);

  }

  exportExcel() {
    const headers: any = this.isSubDomain ? ['Domain Name', 'Code', 'status'] : ['Domain Name', 'Domain Code', 'Sub Domain Name', 'SubDomain Code', 'status']
    let responseData = structuredClone(this.isSubDomain ? this.dataSource.filteredData : this.dataSourceManage.filteredData)

    if (this.isSubDomain) {
      responseData.forEach((element: any) => {
        element['Domain Name'] = element['domainName']
        element['Code'] = element['domainCode']
        element['status'] = element['status'] ? 'Active' : 'Inactive'
      });
    }
    else {
      responseData.forEach((element: any) => {
        element['Domain Name'] = element['domainMaster']['domainName']
        element['Domain Code'] = element['domainMaster']['domainCode']
        element['Sub Domain Name'] = element['subDomainName']
        element['SubDomain Code'] = element['subDomainCode']
        element['status'] = element['status'] ? 'Active' : 'Inactive'
      });
    }
    setTimeout(() => {
      this._ExcelService.downloadFile(responseData, 'domain_master', headers);
    }, 500);
  }

}
