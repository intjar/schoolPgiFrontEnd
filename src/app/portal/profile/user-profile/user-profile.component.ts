import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { Common } from 'src/app/commons/common';
import { ToastService } from 'src/app/services/toast';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  displayedColumns = ['sn', 'eventName', 'date', 'time'];
  dataSource = new MatTableDataSource<any>();
  // @ViewChild('viewtable') set viewtable(value: MatPaginator) {
  //   this.dataSource.paginator = value;
  // }
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  isSubmitted: boolean = false;
  profileForm: FormGroup;
  createdById;
  userId;
  resValue;
  date;
  isVisible: boolean = false;
  session
  msg: string;
  updating: boolean = false;
  isLoading: boolean = false;
  timer: number = Common.timeout;
  breadcrums = {
    heading: 'My Profile', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'My Profile', current: true }
    ]
  }
  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private _location: Location,
    private toast: ToastService
  ) {
    this.profileForm = this.formBuilder.group({
      userName: new FormControl('', [Validators.required]),
      fullName: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required]),
      contactNumber: new FormControl('', [Validators.required, Validators.minLength(10)]),
      level: new FormControl('', [Validators.required]),
      instance: new FormControl('', [Validators.required]),

    })
    this.createdById = (sessionStorage.getItem("userId"));
    let getdetails: any = (sessionStorage.getItem('userDetails'))
    this.session = JSON.parse(getdetails);

  }
  ngOnInit() {
    this.loginDetails();
    this.viewlogsReport();
    this.toast.dismissSnackBar();
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }


  backToLevel() {
    this._location.back();
  }
  loginDetails() {
    this.profileForm.patchValue({
      'userName': this.session?.username.toLowerCase(),
      'fullName': this.session?.name,
      'role': this.session?.roleName,
      'emailId': this.session?.email.toLowerCase(),
      'contactNumber': this.session?.mobileNo,
      'level': this.session?.levelName,
      'instance': this.session?.instanceName
    })
  }

  onSubmit() {
    let isprofile: boolean = true
    let message
    this.isSubmitted = true;
    this.updating = true;
    let data = {
      "id": parseInt(this.session.uid),
      "name": this.profileForm.value.fullName,
      "username": this.profileForm.value.userName.toLowerCase(),
      "email": this.profileForm.value.emailId.toLowerCase(),
      "mobileNo": parseInt(this.profileForm.value.contactNumber),
      "levelId": this.session?.levelId,
      "instanceId": this.session?.instanceId,
      "roleId": this.session?.roleId,
      "loggedInUserId": parseInt(this.createdById),
      "status": this.session?.status,
      "isprofile": isprofile
    }
    if (this.profileForm.valid) {
      // var id = parseInt(this.session.uid);
      this.dataService.updateUser(data).subscribe((res) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        this.isSubmitted == false;
        if (resJSON.success == true) {
          this.updating = false;
          let obj = {
            'name': this.profileForm.value.fullName,
            'email': this.profileForm.value.emailId.toLowerCase(),
            'mobileNo': this.profileForm.value.contactNumber,
            'roleName': this.profileForm.value.role,
            'levelId': this.session?.levelId,
            'username': this.session?.username.toLowerCase(),
            'instanceId': this.session?.instanceId,
            "id": parseInt(this.session?.uid),
            "roleId": this.session?.roleId,
            "loggedInUserId": parseInt(this.createdById),
            "status": this.session?.status,
            "uid": this.session?.uid,
            "levelName": this.profileForm.value.level,
            "instanceName": this.profileForm.value.instance
          }
          this.toast.showMessage('Profile updated successfully', '', 'success');
          // this.showAlert("Profile updated successfully")
          this.dataService.userValue(obj);
          sessionStorage.setItem('userDetails', JSON.stringify(obj))
          this.session = obj;
        }
        else {
          this.updating = false;
          // message = resJSON?.errorMessage
          // this.showAlert(message)
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        }
      })
    }
  }

  viewlogsReport() {
    this.isLoading = true;
    let data = {
      "loggedInUserId": parseInt(this.createdById),
    }
    this.dataService.viewlogs(data).subscribe((res) => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON?.status) {
        this.dataSource = new MatTableDataSource<any>(resJSON.users);
        this.dataSource.paginator = this.viewtable;
        // this.dataSource.sort = this.sort;
        this.sortData();
      }
      else {
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
        // this.showAlert(resJSON?.errorMessage)
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      // this.showAlert('Something went wrong!')
      this.toast.showMessage('Something went wrong!', '', 'unsuccess');
    })
  }

  onCancel() {
    this.isSubmitted = false;
    this.loginDetails()
  }

  // showAlert(data): void {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }
}
