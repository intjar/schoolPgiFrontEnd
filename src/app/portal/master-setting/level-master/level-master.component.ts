import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-level-master',
  templateUrl: './level-master.component.html',
  styleUrls: ['./level-master.component.scss'],
})
export class LevelMasterComponent {
  displayedColumns = [
    'sn',
    'level_name',
    'level_code',
    'parent_level_name',
    'role_ids_name',
    'status',
    'action',
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('viewtable') set viewtable(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  @ViewChild(MatSort) sort: MatSort;

  isVisible: boolean = false;
  msg: string;
  isShowButton: boolean = true;
  parentLevelArr: any = [];
  rolesArr: any = [];
  levelForm: FormGroup;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  levelMSG = 'Add Level';
  isSubmitted: boolean = false;
  createdById: any;
  ID: any;
  parentLevelID: any;
  roleID: any = [];
  dataResponse: any = [];
  isShowPopup: boolean = false;
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Level Master', current: true },
    ],
  };
  updating: boolean = false;
  isLoading: boolean = false;
  printPage: any = Common;
  pdfOpen: boolean = false
  public config = Common.config;
  levelSearch: string = "";
  isGenerating: boolean = false
  public scroll = Common.scroll
  timer: number = Common.timeout;
  isViewClick: boolean = false
  constructor(
    private dataservice: DataService,
    private formBuillder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private toast: ToastService
  ) {
    this.levelForm = this.formBuillder.group({
      levelname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      parentlevel: new FormControl(null, [Validators.required]),
      roles: new FormControl('', [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      code: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(6),
      ]),
    });
    this.levelForm.controls['status'].setValue(this.default);
    this.createdById = sessionStorage.getItem('userId');
  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.levelMasterReport();
    this.roleReport();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  onSelectChange1(data) {
    this.parentLevelID = data;
  }

  onSelectChange2(data) {
    this.roleID = [];
    data.forEach((element) => {
      this.roleID.push(element?.id);
    });

  }

  showTitle(item: any) {
    let title: any = []
    item.slice(1, item.length)?.forEach((element) => {
      title.push(element?.name)
    });
    return title.join('\n')
  }

  onSubmit(action) {
    this.isSubmitted = true;
    this.updating = true;
    if (this.levelForm.invalid) {
      this.updating = false;
      return;
    } else {
      var statusValue, message;
      if (this.levelForm.value.status == 'Active') {
        statusValue = true;
      } else {
        statusValue = false;
      }
      if (action == 'save') {
        message = 'You have successfully saved the data';
        this.ID = '';
      } else if (action == 'update') {
        message = 'You have successfully updated the data';
      }
      let data = {
        id: this.ID,
        levelName: this.levelForm.value.levelname.replace(/ {2,}/g, ' ').trim(),
        levelCode: parseInt(this.levelForm.value.code),
        parentLevelId: this.parentLevelID,
        roleIds: this.roleID.join(','),
        status: statusValue,
        loggedInUserId: parseInt(this.createdById),
      };
      this.dataservice.addCreateLevelMaster(data).subscribe(
        (res: any) => {
          // let resSTR = JSON.stringify(res);
          // let resJSON = JSON.parse(resSTR);
          this.isSubmitted = false;
          if (res?.success == true) {
            this.levelMSG = 'Add Level';
            this.isShowButton = true;
            this.updating = false;
            this.levelForm.reset();
            this.levelForm.controls['status'].setValue(this.default);
            this.toast.showMessage(message, '', 'success')
            this.levelMasterReport();
          } else {
            this.isSubmitted = false;
            this.updating = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
          this.levelSearch = "";
        },
        (error) => {
          this.updating = false;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        }
      );
    }
  }

  applyFilter(event: any, action: string) {
    let filterValue = this.levelSearch;
    if (filterValue.length > 0) {
      let roleFilters = this.dataResponse.filter((x: any) => {
        return (
          (x.level_name
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x.level_code?.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x.parent_level_name?.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x.role_ids_name?.toString()
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1)
        );
      });
      this.dataSource = new MatTableDataSource<any>(roleFilters);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    } else {
      this.dataSource = new MatTableDataSource<any>(this.dataResponse);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    }
  }

  onCancel() {
    this.levelMSG = 'Add Level';
    this.isViewClick = false;
    this.isShowButton = true;
    this.levelForm.reset();
    this.levelForm.enable()
    this.levelForm.controls['status'].setValue(this.default);
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data;
  //   setTimeout(() => (this.isVisible = false), this.timer);
  // }
  roleReport() {
    this.rolesArr = [];
    this.dataservice.addRoleMasterView().subscribe(
      (res: any) => {
        // let resSTR = JSON.stringify(res);
        // let resJSON = JSON.parse(resSTR);
        if (res?.success == true) {
          res?.result.forEach((element) => {
            if (element?.status) {
              this.rolesArr.push(element);

            }
          });
        } else {
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  exportExcel() {
    this.isGenerating = true
    const headers: any = ['Level Name', 'Code', 'Parent Level', 'Assigned Role', 'status']
    let responseData = structuredClone(this.dataSource.filteredData)
    responseData.forEach((element: any) => {
      element['Level Name'] = element['level_name']
      element['Code'] = element['level_code']
      element['Parent Level'] = element['parent_level_name']
      element['Assigned Role'] = element['role_ids_name'].replaceAll(",", "-");
      element['status'] = element['status'] ? 'Active' : 'Inactive'
    });
    setTimeout(() => {
      this._ExcelService.downloadFile(responseData, 'master_level', headers);
      this.isGenerating = false
    }, 500);
  }

  levelMasterReport() {
    this.parentLevelArr = [];
    this.isLoading = true;
    this.dataSource = new MatTableDataSource<any>();
    let obj = {
      "isDropDown": null
    }
    this.dataservice.addLevelMasterViewLevel(obj).subscribe(
      (res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = res;
        // console.log(res)
        if (resJSON.status) {

          this.dataResponse = resJSON?.result;
          this.dataSource = new MatTableDataSource<any>(this.dataResponse);
          this.dataSource.paginator = this.viewtable;
          this.dataSource.sort = this.sort;
          this.sortData();
          this.dataResponse?.forEach((item) => {
            if (item?.status) {
              this.parentLevelArr.push(item);
            }
          });
          this.isLoading = false
        } else {
          this.isLoading = false
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  edit(object: any, button: any) {
    if (button == "edit") {
      this.levelMSG = 'Edit Level';
      this.isViewClick = false;
      this.levelForm.enable();
    } else {
      this.levelMSG = 'View Level';
      this.isViewClick = true;
      this.levelForm.disable();
    }

    var statusValue, roleidData, focus;
    this.roleID = [];
    this.roleID.push(object?.role_ids);
    this.isShowButton = false;
    this.ID = object?.id;
    this.parentLevelID = object?.parent_level_id;

    if (object.status == true) {
      statusValue = 'Active';
    } else {
      statusValue = 'Inactive';
    }

    roleidData = object?.role_ids_name.split(',');
    this.levelForm.patchValue({
      levelname: object?.level_name,
      parentlevel:
        object?.parent_level_name == null ? 'NA' : object?.parent_level_name,
      roles: roleidData,
      code: object?.level_code,
      status: statusValue,
    });

    focus = document.getElementById('focusForm');
    focus.scrollIntoView();
  }

  remove(object: any) {
    this.isShowPopup = true;
    this.ID = object;
  }

  removeRecord(item) {
    if (item) {
      this.isGenerating = true
      let obj = {
        id: this.ID?.id,
        loggedInUserId: parseInt(this.createdById),
      };
      this.dataservice.addDeleteLevelMaster(obj).subscribe(
        (res: any) => {
          // let resSTR = JSON.stringify(res);
          // let resJSON = JSON.parse(resSTR);
          if (res?.success == true) {
            this.onCancel()
            this.levelMasterReport();
            this.isShowPopup = false;
            this.isGenerating = false
          }
          else {
            this.isShowPopup = false;
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
            this.isGenerating = false
          }
        },
        (error) => {
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
          this.isGenerating = false
        }
      );
    } else {
      this.isShowPopup = false;
    }
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

}
