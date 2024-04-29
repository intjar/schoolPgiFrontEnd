import { Component, OnInit } from '@angular/core';
import { error } from 'jquery';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  getNotification: any = []
  createdById: any;
  readId: number = 1;
  unReadId: number = 1;
  timer: number = Common.timeout;
  isVisible: boolean = false;
  msg: string;
  breadcrums = {
    heading: 'Notification', links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Notification', current: true }
    ]
  }
  // readMessage: boolean = true;
  constructor(private dataService: DataService) {
    this.createdById = (sessionStorage.getItem("userId"));
  }

  ngOnInit() {
    this.getNotify()
  }

  getNotify() {
    let obj = {
      "loggedInUserId": parseInt(this.createdById)
    }
    this.dataService.viewNotification(obj).subscribe((res: any) => {
      // if (res?.length > 0) {
      //   let resSTR = JSON.stringify(res);
      //   let resJSON = JSON.parse(resSTR)
      //   this.getNotification = resJSON;
      //   console.log(this.getNotification);
      // }
      // this.getNotification = resJSON?.result;
      this.dataService.setNotificationData(this.getNotification);
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      if (resJSON?.result) {
        this.getNotification = resJSON?.result;
        this.dataService.setNotificationData(this.getNotification);
      } else {
        this.showAlert(resJSON?.errorMessage)
      }
    }, (error) => {
      this.showAlert('Something went wrong')

    })
  }

  read_unread(flag: boolean) {
    this.createdById = (sessionStorage.getItem("userId"));
    let data = {
      "id": this.readId,
      "loggedInUserId": parseInt(this.createdById),
      "flag": flag
    }
    this.dataService.markNotificationAsRead_unread(data)?.subscribe((res) => {
      this.getNotify()
    })
  }

  // flag : boolean = true
  //   notify(event, index) {
  //     if (event.target.checked) {
  //       this.getNotification[index].flag = true
  //       this.flag = true
  //     } else {
  //       this.getNotification[index].flag = false
  //       this.flag = false
  //     }
  //   }

  showAlert(data): void {
    if (this.isVisible) {
      return;
    }
    this.isVisible = true;
    this.msg = data
    setTimeout(() => this.isVisible = false, this.timer)
  }
}
