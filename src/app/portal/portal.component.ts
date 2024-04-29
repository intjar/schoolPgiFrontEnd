import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { SideMenuService } from '../services/side-menu.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})

export class PortalComponent {
  isShow: boolean = false;
  constructor(public dataservice : DataService,public sideMenuService:SideMenuService,public router: Router) {
      this.dataservice.subject.subscribe(res=>{    

          this.isShow = res
    })
  //   if(this.router.url.includes('survey-data-entry')){
  //     this.sideMenuService.pageChange.subscribe(value => {
  //       if(value){
  //         this.isShow = true
  //         this.dataservice.passValue(this.isShow)
  //       }
  //       else if(!value){
  //         this.isShow = false
  //         this.dataservice.passValue(this.isShow)
  //       }
        
  //   });
    
  // }
  // else{
    
  //     this.isShow = false
  //     this.dataservice.passValue(this.isShow)
    
  // }
  }

 
  
}
