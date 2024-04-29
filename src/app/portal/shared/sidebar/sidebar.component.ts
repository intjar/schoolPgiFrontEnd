import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { ToastService } from 'src/app/services/toast';
import { SideMenuService } from 'src/app/services/side-menu.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  session: any;
  menusData: any = [];
  allMenus: Array<any> = [];
  username: any;
  roleName: string
  levelName: string
  instanceName: string
  show: boolean = false;
  
  constructor(private dataservice: DataService, public router: Router, private toast: ToastService , public sideMenuService:SideMenuService,private cdRef:ChangeDetectorRef) {
    let getdetails: any = (sessionStorage.getItem('userDetails'));
    //this.session = JSON.parse(getdetails);
  }

  ngOnInit(): void {
    // Get the Current User name from observables
    this.dataservice?.currentUser?.subscribe((data: any) => {
      this.session = data;
      this.getUserName();
    });

    // Get The last menus json 
    this.dataservice?.menusData?.subscribe((data: any) => {
      this.menusData = data;
      this.allMenus = [];
      const menus: Array<any> = [];
      // Iterate over the data to create menus and submenus
      this.menusData.forEach((menuArray: any[]) => {
        menuArray.forEach((menu: any) => {
          if (menu?.menuGroupId == 0 && (menu?.type == "Menu" || menu?.type == "StaticMenu")) {
            let menuD = {
              ...menu,
              subMenu: []
            }
            this.allMenus.push(menuD);
          } else {
            this.allMenus.map((submenu: any, i: number) => {
              if (submenu?.orderId == menu?.menuGroupId) {
                if ((menu?.accesstype == "create" || menu?.accesstype == "edit" || menu?.accesstype == "view" || menu?.accesstype == "delete") && menu?.status == true) {
                  let SubMenuExists = this.allMenus[i].subMenu.find((subData: any) => {
                    return subData?.title == menu?.title
                  })
                  if (!SubMenuExists) {
                    this.allMenus[i].subMenu.push(menu);
                  }
                }
              }
              //Sort Sub Menus According to Order
              this.allMenus[i]?.subMenu.sort((a: any, b: any) => (a?.orderId) > b?.orderId ? 1 : -1)
            })
          }
        });
      });
      //Sort Menus According to Order
      this.allMenus.sort((a, b) => (a?.orderId) > b?.orderId ? 1 : -1)
    });
  
  //   if(this.router.url.includes('survey-data-entry')){
  //     this.sideMenuService.pageChange.subscribe(value => {
  //       if(value){
  //         this.show = true
  //         this.dataservice.passValue(this.show)
  //       }
  //       else if(!value){
  //         this.show = false
  //         this.dataservice.passValue(this.show)
  //       }
        
  //   });
    
  // }
  // else{
    
  //     this.show = false
  //     this.dataservice.passValue(this.show)
    
  // }
    // this.cdRef.detectChanges();
   
  }
  ngAfterViewChecked()
  {

  }

  getUserName() {
    this.username = this.session?.name;
    this.roleName = this.session?.roleName;
    this.levelName = this.session?.levelName;
    this.instanceName = this.session?.instanceName;
  }

  userlogout() {
    this.toast.dismissSnackBar();
    this.dataservice.logout()
  }

  toggleSidebar() {
    this.show = !this.show
    this.dataservice.passValue(this.show)
  }

  toggleMenu(action?: any) {
    this.show = false;
    this.dataservice.passValue(this.show)
  }

  userProfile() {
    this.router.navigate(['/portal/profile/myProfile'])
  }
}
