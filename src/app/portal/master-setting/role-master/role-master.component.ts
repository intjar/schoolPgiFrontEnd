import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DataTableDirective } from 'angular-datatables';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import * as global from 'src/app/globels';
import { Subject, Subscription } from 'rxjs';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgxPrintElementService } from 'ngx-print-element';
import { error } from 'jquery';
import { Common } from 'src/app/commons/common';
import { ExcelService } from 'src/app/services/excel.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-role-master',
  templateUrl: './role-master.component.html',
  styleUrls: ['./role-master.component.scss'],
})
export class RoleMasterComponent {
  displayedColumns = ['sn', 'name', 'code', 'menu', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('viewtable') set viewtable(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  SubdisplayedColumns = ['orderId', 'type', 'title', 'action'];
  dataSourceMenu = new MatTableDataSource<any>();
  // @ViewChild('viewmenutable') set viewmenutable(value: MatPaginator) {
  //   this.dataSourceMenu.paginator = value;
  // }
  @ViewChild(MatPaginator) viewmenutable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) sortMenu: MatSort;
  roleForm: any = FormGroup;

  menuForm: any;
  statusValue: string[] = ['Active', 'Inactive'];
  default: string = 'Active';
  isShowButton: boolean = true;
  ismanageMenu: boolean = false;
  // displayStyle = "none";
  roleId: any;
  manageMenuData: any = [];
  isChecked = false;
  manageMenuRole: any = [];
  // msg: string;
  isVisible: boolean = false;
  isShowcheckbox = '';
  assignRole: any;
  assignStatus: boolean;
  linkIds: any = [];
  isCreateCheck;
  isEditCheck;
  isViewCheck;
  isDeleteCheck;
  roleMSG = 'Add Role';
  ID: any;
  isSubmitted: boolean = false;
  createdById;
  manageMenuupdateData: any = [];
  isShowPopup: boolean = false;
  isLoading: boolean = true;
  isMenuLoading: boolean = true;
  isRolePdf: boolean = true;
  newActionArr: any = [];
  breadcrums = {
    heading: 'Master Setting', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Role Master', current: true }
    ]
  }
  updating: boolean = false
  roleSearch: string = "";
  menuSearch: string = "";
  updatingMenu: boolean = false;
  public config = Common.config;
  pdfOpen: boolean = false;
  public scroll = Common.scroll;
  timer: number = Common.timeout;
  isGenerating: boolean = false
  imageBasePath: string = 'assets/images/';
  userDetails: any;
  isViewClick: boolean = false;
  constructor(
    private dataservice: DataService,
    private _changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    public print: NgxPrintElementService,
    private _ExcelService: ExcelService,
    private toast: ToastService
  ) {
    this.roleForm = this.formBuilder.group({
      rolename: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      code: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(6),
      ]),
      status: new FormControl(null, [Validators.required]),
    });
    this.roleForm.controls['status'].setValue(this.default);

    this.menuForm = this.formBuilder.group({
      rolestatus: new FormControl(this.manageMenuRole[0]),
    });
    this.createdById = sessionStorage.getItem('userId');
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails') as string)
  }

  ngOnInit() {
    this.toast.dismissSnackBar();
    this.roleReport();
  }

  onSubmit(action) {
    this.isSubmitted = true;
    if (this.roleForm.invalid) {
      return;
    } else {
      this.updating = true
      var statusValue, message;
      if (this.roleForm.value.status == 'Active') {
        statusValue = true;
      } else {
        statusValue = false;
      }

      let data = {
        rolename: this.roleForm.value.rolename.replace(/ {2,}/g, ' ').trim(),
        code: parseInt(this.roleForm.value.code),
        status: statusValue,
      };
      if (action == 'save') {
        if (
          data?.rolename != undefined &&
          data?.code != undefined &&
          data?.status != undefined
        ) {
          let obj = {
            rolename: data?.rolename?.trim(),
            code: data?.code,
            status: data?.status,
            loggedInUserId: parseInt(this.createdById),
          };
          this.dataservice.addRoleMaster(obj).subscribe((res: any) => {
            this.isSubmitted = false;
            if (res?.success == true) {
              this.toast.showMessage('You have successfully saved the data', '', 'success');
              this.roleReport();
              this.updating = false
              this.roleForm.controls['rolename'].reset();
              this.roleForm.controls['code'].reset();
              this.roleForm.controls['status'].setValue(this.default);
            } else {
              this.isSubmitted = false;
              this.updating = false
              this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
            }
            this.roleSearch = "";
          },
            (error) => {
              this.isSubmitted = false;
              this.updating = false
              this.toast.showMessage('Something went wrong!', '', 'unsuccess');
            }
          );
        }
      }
      if (action == 'update') {
        let obj = {
          id: this.ID,
          rolename: data?.rolename?.trim(),
          code: data?.code,
          status: data?.status,
          loggedInUserId: parseInt(this.createdById),
        };
        this.dataservice.addRoleMasterUpdateRole(obj).subscribe((res: any) => {
          this.isSubmitted = false;
          if (res?.success == true) {
            this.isShowButton = true;
            this.updating = false
            this.roleMSG = 'Add Role';
            this.toast.showMessage('You have successfully updated the data', '', 'success');
            this.roleReport();
            this.roleForm.reset();
            this.roleForm.controls['status'].setValue(this.default);
          }
          if (res?.success == false) {
            this.isShowButton = false;
            this.updating = false
          }
          this.roleSearch = "";
        }, (error) => {
          this.updating = false
          this.isShowButton = true;
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        });

      }
    }
  }
  onCancle() {
    this.isShowButton = true;
    this.isViewClick = false;
    this.roleMSG = 'Add Role';
    this.roleForm.reset();
    this.roleForm.enable();
    this.roleForm.controls['status'].setValue(this.default);
  }


  // numberOnly(event): boolean {
  //   const charCode = (event.which) ? event.which : event.keyCode;
  //   if (charCode > 31 && (charCode < 48 || charCode > 57)) {    //This checks that the key pressed is numerical, IE the keyCode is between 48 and 57
  //     return false;
  //   }
  //   return true;

  // }

  applyFilter(event: any, action: string) {
    let filterValue = action == 'subMenu' ? this.menuSearch : this.roleSearch;
    if (action == 'role') {
      if (filterValue.length > 0) {
        let roleFilters = this.manageMenuRole.filter((x: any) => {
          return (
            (x.name
              ?.toLocaleLowerCase()
              .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
            (x.code.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue.trim().toLocaleLowerCase()) > -1)
          );
        });
        this.dataSource = new MatTableDataSource<any>(roleFilters);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      } else {
        this.dataSource = new MatTableDataSource<any>(this.manageMenuRole);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
      }
    }

    else {
      if (filterValue.length > 0) {
        let menuFilters = this.manageMenuData.filter(k => k.some(x => (
          (x?.title
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1) ||
          (x?.type
            ?.toLocaleLowerCase()
            .indexOf(filterValue.trim().toLocaleLowerCase()) > -1)
        )));
        this.dataSourceMenu = new MatTableDataSource<any>(menuFilters);
        this.dataSourceMenu.paginator = this.viewmenutable;
        this.dataSourceMenu.sort = this.sortMenu;
      } else {
        this.dataSourceMenu = new MatTableDataSource<any>(this.manageMenuData);
        this.dataSourceMenu.paginator = this.viewmenutable;
        this.dataSourceMenu.sort = this.sortMenu;


      }
    }
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  roleReport() {
    this.manageMenuRole = [];
    this.isLoading = true;
    this.dataSource = new MatTableDataSource<any>();
    this.dataservice.addRoleMasterView().subscribe((res: any) => {
      if (res?.success == true) {
        // Remove Admin row from data list
        // let dataSource = res?.result.filter((a:any) => {
        //   return a?.id !== 1
        // });
        let dataSource = res?.result;
        this.manageMenuRole = dataSource;
        this.dataSource = new MatTableDataSource<any>(dataSource);
        this.dataSource.paginator = this.viewtable;
        this.dataSource.sort = this.sort;
        this.sortData();
        this.isLoading = false;
      } else {
        this.dataSource = new MatTableDataSource<any>();
        this.isLoading = false;
        this.toast.showMessage(res?.message, '', 'unsuccess');
      }
    },
      (error) => {
        this.dataSource = new MatTableDataSource<any>();
        this.isLoading = false;
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
      }
    );
  }

  edit(object: any, button: any) {
    console.log('object', object)
    if (button == "edit") {
      this.roleMSG = 'Edit Role';
      this.isViewClick = false;
      this.roleForm.enable();
    } else {
      this.roleMSG = 'View Role';
      this.isViewClick = true;
      this.roleForm.disable();
    }
    let focus;
    this.isShowButton = false;
    this.ID = object?.id;
    var statusValue;
    if (object?.status == true) {
      statusValue = 'Active';
    } else {
      statusValue = 'Inactive';
    }
    // this.roleForm.controls['rolename'].setValue(object.name); // single field set
    this.roleForm.patchValue({
      rolename: object?.name,
      code: object?.code,
      status: statusValue,
    }); // multiple field set
    focus = document.getElementById('focusForm');
    focus.scrollIntoView();
  }

  remove(object: any) {
    this.isShowPopup = true;
    this.ID = object?.id;
  }
  removeRecord(item) {
    let data = {
      loggedInUserId: parseInt(this.createdById),
      id: this.ID,
    };
    if (item) {
      this.dataservice.addRoleMasterDeleteRole(data).subscribe((res: any) => {
        if (res?.success == true) {
          this.isShowPopup = false;
          this.onCancle();
          this.roleReport();
        } else {
          this.isShowPopup = false;
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
        this.roleSearch = "";
      },
        (error) => {
          this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        }
      );
    } else {
      this.isShowPopup = false;
    }
  }

  onSelectChange(data) {
    if (data != undefined) {
      this.dataSourceMenu = new MatTableDataSource<any>([]);
      this.dataSourceMenu.paginator = this.viewmenutable;
      this.dataSourceMenu.sort = this.sortMenu;
      this.manageMenu(data);

    }
  }

  manageMenu(value) {
    this.isRolePdf = false;
    this.breadcrums = {
      heading: 'Master Setting', links: [
        { link: 'Dashboard', routing: '/dashboard/dashboard' },
        { link: 'Master Setting' },
        { link: 'Role Master' },
        { link: 'Manage Menu', current: true }
      ]
    }

    this.manageMenuData = [];
    this.menuSearch = "";
    this.assignRole = value?.name?.trim();
    this.roleId = value?.id;
    this.ismanageMenu = true;
    var obj = {
      id: value?.id,
      code: value?.code,
    };
    console.log('obj', obj)
    this.isMenuLoading = true;
    this.dataservice.addRoleMasterManageMenu(obj).subscribe((res: any) => {
      if (res?.success == true) {
        this.manageMenuData = res?.result;
        this.manageMenuData.sort(this.compareMenuItems);
        console.log('this.manageMenuData', this.manageMenuData)
        this.manageMenuupdateData = structuredClone(this.manageMenuData);
        this.dataSourceMenu = new MatTableDataSource<any>(this.manageMenuData);
        this.dataSourceMenu.paginator = this.viewmenutable;
        this.dataSourceMenu.sort = this.sortMenu;
        this.linkIds = [];
        this.manageMenuData.map((k: any) => k.map((x: any) => {
          if (x?.status) {
            let checkLinkExists = this.linkIds.findIndex((linkd: any) => {
              linkd?.id == x?.id
            })
            if (checkLinkExists == -1) {
              this.linkIds.push(x?.id);
            }
          };
        }));

        this.isMenuLoading = false;
      } else {
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        this.isMenuLoading = false;
      }
    },
      (error) => {
        this.toast.showMessage('Something went wrong!', '', 'unsuccess');
        this.isMenuLoading = false;
      }
    );
  }


  compareMenuItems(a, b) {
    const orderIdA = parseFloat(a[0].orderId);
    const orderIdB = parseFloat(b[0].orderId);
  
    if (orderIdA < orderIdB) {
      return -1;
    }
    if (orderIdA > orderIdB) {
      return 1;
    }
    return 0;
  }

  clickCheckbox(event: any, element: number, method: string) {
    var index = this.manageMenuData.findIndex((innerElement, index) => {
      return innerElement.some((e) => {
        if (e?.orderId == element[0]?.orderId) return index;
      })
    })
    let dataIndex = this.manageMenuData[index]?.findIndex((data: any) => data?.accesstype == method);
    this.manageMenuData[index][dataIndex].status = event?.target?.checked;
    if (event.target.checked) {
      this.linkIds.push(this.manageMenuData[index][dataIndex]?.id)
    } else {
      this.linkIds.splice(this.linkIds.indexOf(this.manageMenuData[index][dataIndex]?.id), 1);
    }
  }

  assignMenu(action) {
    if (this.menuForm.invalid) {
      return;
    }
    if (action == 'save') {
      if (this.assignRole && this.assignRole != null) {
        this.updatingMenu = true;
        var obj = {
          jsonUrl: JSON.stringify(this.manageMenuData),
          linkIds: this.linkIds.join(','),
          roleid: this.roleId,
          loggedInUserId: parseInt(this.createdById),
        };
        this.dataservice.addRoleMasterAssignMenu(obj).subscribe((res: any) => {
          if (res?.success == true) {
            this.toast.showMessage(res.message, '', 'success');
            this.manageMenuupdateData = structuredClone(this.manageMenuData);
            //check the role id matches with logged in role id and update the instant session for logged in user
            if (this.roleId == this.userDetails?.roleId) {
              this.dataservice.updateMenuJson(this.manageMenuData);
              //sessionStorage.setItem('menus', JSON.stringify(this.manageMenuData));
            }
          } else {
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
          }
          //this.menuSearch = "";
          this.updatingMenu = false;
        });
      } else {
        this.toast.showMessage('Please select role name', '', 'unsuccess');
      }
    }
    if (action == 'cancel') {
      this.manageMenuData = structuredClone(this.manageMenuupdateData);
      this.dataSourceMenu = new MatTableDataSource<any>(structuredClone(this.manageMenuData));
      this.dataSourceMenu.paginator = this.viewmenutable;
      this.dataSourceMenu.sort = this.sortMenu;
      this.menuSearch = "";
    }
  }

  backToLevel(event: boolean) {
    this.isGenerating = true
    if (this.ismanageMenu) {
      this.isViewClick = false;
      this.roleForm.reset();
      this.roleForm.enable()

      this.roleForm.controls['status'].setValue(this.default);
      this.ismanageMenu = false;
      this.isRolePdf = true
      this.breadcrums = {
        heading: 'Master Setting', links: [
          { link: 'Dashboard', routing: '/dashboard/dashboard' },
          { link: 'Master Setting' },
          { link: 'Role Master', current: true }
        ]
      }
      this.roleMSG = 'Add Role';
      this.isShowButton = true;
      this.roleReport();
      this.roleSearch = "";
      this.isGenerating = false
    }

  }

  isMenuChecked(event: any, method: string) {
    let checkChecked = event.filter((data: any) => {
      return data?.status == true && data?.accesstype == method
    });
    if (checkChecked.length > 0) {
      return true
    } else {
      return false;
    }
  }

  isMenuDisabled(event: any, method: string) {
    let checkDisabled = event.filter((data: any) => {
      return data?.accesstype == method
    });
    if (checkDisabled.length > 0) {
      return false
    } else {
      return true;
    }
  }


  printPDF() {
    this.isGenerating = true
    this.pdfOpen = true;
    let responseData = structuredClone(this.dataSourceMenu.filteredData)
    responseData.forEach((element: any, index: number) => {
      let actionArr: any = []
      element?.forEach(item => {
        if ((item?.accesstype == "create" && item?.status == true)) {
          actionArr.push('create')
        }
        if ((item?.accesstype == "edit" && item?.status == true)) {
          actionArr.push('edit')
        }
        if ((item?.accesstype == "view" && item?.status == true)) {
          actionArr.push('view')
        }
        if ((item?.accesstype == "delete" && item?.status == true)) {
          actionArr.push('delete')
        }
      });
      this.newActionArr[index] = actionArr.join(',')
    });
    setTimeout(() => {
      this.print.print('print-pdf', this.config);
      // this.printPage.printPage()
      this.pdfOpen = false
      this.isGenerating = false;
    }, 500);

  }

  exportExcel(action) {
    if (action == 'role') {
      this.isGenerating = true
      const headers: any = ['role name', 'code', 'status']
      let responseData = structuredClone(this.dataSource.filteredData)
      responseData.forEach((element: any) => {
        element['role name'] = element['name']
        element['code'] = element['code']
        element['status'] = element['status'] ? 'Active' : 'Inactive'
      });
      setTimeout(() => {
        this._ExcelService.downloadFile(responseData, 'master_role', headers);
        this.isGenerating = false;
      }, 500);
    }
    else if (action == 'managemenu') {
      this.isGenerating = true
      const headers: any = ['orderId', 'type', 'title', 'action']
      let responseData = structuredClone(this.dataSourceMenu.filteredData)
      let newArr: any = []
      responseData.forEach((element: any, index: number) => {
        newArr.push(element[0])
        let actionArr: any = []
        element?.forEach(item => {
          if ((item?.accesstype == "create" && item?.status == true)) {
            actionArr.push('create')
          }
          if ((item?.accesstype == "edit" && item?.status == true)) {
            actionArr.push('edit')
          }
          if ((item?.accesstype == "view" && item?.status == true)) {
            actionArr.push('view')
          }
          if ((item?.accesstype == "delete" && item?.status == true)) {
            actionArr.push('delete')
          }
        });
        newArr[index]['action'] = actionArr.join(',').replaceAll(",", "-")
      });


      setTimeout(() => {
        this._ExcelService.downloadFile(newArr, this.assignRole, headers);
        this.isGenerating = false;
      }, 500);
    }

  }


}
