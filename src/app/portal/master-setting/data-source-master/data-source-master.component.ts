import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-data-source-master',
  templateUrl: './data-source-master.component.html',
  styleUrls: ['./data-source-master.component.scss']
})
export class DataSourceMasterComponent {

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['sn', 'name', 'code', 'url', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('viewtable') set viewtable(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  dtOptionsLevel: any;
  parentLevelArr: any = [];
  dataSourceForm: FormGroup;
  default: string = 'Active';
  isSubmitted: boolean = false;
  isShowButton: boolean = true;
  statusValue: string[] = ['Active', 'Inactive'];
  isVisible: boolean = false;
  msg: string;
  dataSourceMSG = "Manage Data Source";
  displayStyle = "none";
  createdById;
  isShowPopup: boolean = false;
  ID: any;
  public config = Common.config;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Data Source Master', current: true },
    ],
  };
  isLoading: boolean = false;
  pdfOpen: boolean = false;
  isViewClick: boolean = false;
  data: Array<any> = [];
  searchFilter: string = "";
  public scroll = Common.scroll
  updating: boolean = false
  constructor(private dataservice: DataService,
    private formBuillder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService) {
    this.dataSourceForm = this.formBuillder.group({
      sourcename: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      code: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6)]),
      status: new FormControl(null, [Validators.required]),
      url: new FormControl(null)
    })
    this.dataSourceForm.controls['status'].setValue(this.default);
    this.createdById = (sessionStorage.getItem("userId"));
  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.dataSourceReport();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  dataSourceReport() {
    let message: any;
    this.isLoading = true;
    this.dataSource = new MatTableDataSource<any>();
    this.dataservice.addDataSourceViewLevel().subscribe((res: any) => {
      // let resSTR = JSON.stringify(res);
      // let resJSON = JSON.parse(resSTR);

      if (res?.success) {
        let dataSource = res?.result;
        this.data = dataSource;
        this.dataSource = new MatTableDataSource<any>(dataSource);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
        this.isLoading = false
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
        this.isLoading = false
      }
    }, (error) => {
      this.isLoading = false
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  onSubmit(action) {
    this.isSubmitted = true
    this.updating = true
    let message;
    if (this.dataSourceForm.invalid) {
      this.updating = false
      return
    } else {
      var statusValue
      if (this.dataSourceForm.value.status == 'Active') {
        statusValue = true
      } else {
        statusValue = false
      }
      if (action == 'save') {
        this.ID = null
        message = 'You have successfully saved the data'
      }
      else if (action == 'update') {
        message = "You have successfully updated the data"
      }
      let data = {
        "id": this.ID,
        'name': this.dataSourceForm.value.sourcename.replace(/ {2,}/g, ' ').trim(),
        'code': parseInt(this.dataSourceForm.value.code),
        'url': this.dataSourceForm.value.url ? this.dataSourceForm.value.url.replace(/ {2,}/g, ' ').trim() : null,
        'status': statusValue,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.dataservice.addCreateDataSource(data).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmitted = false
        if (resJSON.success == true) {
          this.dataSourceMSG = "Manage Data Source";
          this.isShowButton = true;
          this.toast.showMessage(message, '', 'success')
          this.dataSourceReport();
          this.dataSourceForm.reset();
          this.dataSourceForm.controls['status'].setValue(this.default);
          this.searchFilter = "";
          this.updating = false
        } else {
          this.isSubmitted = false
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
    this.isShowButton = true;
    this.isViewClick = false;
    this.dataSourceMSG = "Manage Data Source";
    this.dataSourceForm.reset();
    this.dataSourceForm.enable();
    this.dataSourceForm.controls['status'].setValue(this.default);
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

  edit(object: any, button: any) {
    if (button == "edit") {
      this.dataSourceMSG = 'Edit Data Source';
      this.isViewClick = false;
      this.dataSourceForm.enable();
    } else {
      this.dataSourceMSG = 'View Data Source';
      this.isViewClick = true;
      this.dataSourceForm.disable();
    }

    let focus, statusValue
    this.isShowButton = false;
    this.ID = object?.id;
    if (object.status == true) {
      statusValue = 'Active'
    } else {
      statusValue = 'Inactive'
    }
    // roleidData = object.role_ids_name.split(',')
    this.dataSourceForm.patchValue({
      'sourcename': object?.name,
      'url': object?.url,
      'code': object?.code,
      'status': statusValue
    })

    focus = document.getElementById("focusForm");
    focus.scrollIntoView();
  }

  remove(object: any) {
    this.isShowPopup = true
    this.ID = object
  }

  removeRecord(item) {
    if (item) {
      let obj = {
        'id': this.ID?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      let message;
      this.dataservice.addDeleteDataSource(obj).subscribe(res => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON.success == true) {
          this.isShowPopup = false;
          this.onCancel();
          this.dataSourceReport();
        } else {
          this.isShowPopup = false;
          this.isSubmitted = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isShowPopup = false
    }
  }

  applyFilter(event: any) {
    let filterValue = this.searchFilter;
    if (filterValue.length > 0) {
      let roleFilters = this.data?.filter((x: any) => {
        return (
          (
            (x?.name
              ?.toLocaleLowerCase()
              .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
            (x?.code.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
            (x?.url.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1))
        );
      });
      this.dataSource = new MatTableDataSource<any>(roleFilters);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    } else {
      this.dataSource = new MatTableDataSource<any>(this.data);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    }
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
    const headers: any = ['Data Source Name', 'Code', 'URL', 'Status']
    let responseData = structuredClone(this.dataSource.filteredData)

    responseData.forEach((element: any) => {
      element['Data Source Name'] = element['name']
      element['Code'] = element['code']
      element['URL'] = element['url']
      element['Status'] = element['status'] ? 'Active' : 'Inactive'
    });
    setTimeout(() => {
      this._ExcelService.downloadFile(responseData, 'domain_master', headers);
    }, 500);
  }

}
