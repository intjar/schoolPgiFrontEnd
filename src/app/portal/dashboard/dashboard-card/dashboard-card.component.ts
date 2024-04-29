import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent {
  @Input() data:any = {};
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');

  constructor(private router:Router){

  }

  getSurveyStatusList(status:any){
    if(status == "users_list"){
      this.router.navigate(['/portal/manage-user/instanceuser']);
    }else{
      this.router.navigate(['./portal/report/survey-status-list-report',status]);
    }

    // if(this.getSession?.roleId ==1){
    //   if(status == "users_list"){
    //     this.router.navigate(['/portal/manage-user/instanceuser']);
    //   }else{
    //     this.router.navigate(['./portal/report/survey-status-list-report',status]);
    //   }
    // }else{
    //   return;
    // }
    
  }
}
