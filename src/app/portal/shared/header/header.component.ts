import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{
  viewNotification: any = [];
  createdById;
  constructor(private dataService:DataService , private router : Router){}
  ngOnInit(){
  // this.getNotified()
  }
  getNotified(){
    this.createdById = (sessionStorage.getItem("userId"));
    let obj ={
      "loggedInUserId" :  parseInt(this.createdById)
    }
    this.dataService.viewNotification(obj).subscribe((res)=>{
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      this.viewNotification = resJSON?.result;   
      this.dataService.setNotificationData(this.viewNotification);
    })
  }

  Notification(){

  
    this.router.navigate(["/portal/notification"])
    
  }

}
