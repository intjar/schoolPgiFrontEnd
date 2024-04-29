import { NgModule } from '@angular/core';
import { PortalRoutingModule } from './portal-routing.modules';
import { PortalComponent } from './portal.component';
import { NotificationComponent } from './notification/notification.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    NotificationComponent
  ],
  imports: [
    PortalRoutingModule,
    CommonModule,
    SharedModule
  ],
  bootstrap: [PortalComponent]
})
export class PortalModule { }
