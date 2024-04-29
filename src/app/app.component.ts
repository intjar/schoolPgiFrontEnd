import { Component, HostBinding, HostListener } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from './services/data.service';
import { ToastService } from './services/toast';

export let  browserRefresh = false;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'schoolPGI';

// **************************** Set logout after 10 min without any movement ******************************

  @HostBinding('@.disabled')
  public animationsDisabled = false; // Set to true to disable animations
  idleTime:number = 0;
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.idleTime = 0
  }
  subscription: Subscription;
  constructor(private router: Router, private dataservice: DataService, private toastService:ToastService) {
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }

  ngOnInit() {
    this.toastService.dismissSnackBar();
    // if(!window.location.hostname.includes('localhost')){
      this.idleTime = 0
      setTimeout(() => {
        setInterval(() => { this.timerIncrement(); },60000 );
      }, 1000);
    // }

  }

  timerIncrement() {
    this.idleTime = this.idleTime + 1;
    if (this.idleTime > 10) {
      this.dataservice.logout();
    }
  }
// **********************************************************

}
