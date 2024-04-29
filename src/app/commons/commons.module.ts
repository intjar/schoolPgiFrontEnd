import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopupComponent } from 'src/app/commons/popup/popup.component';
import { ConfirmComponent } from './confirm/confirm.component';

@NgModule({
  declarations: [
     PopupComponent,
     ConfirmComponent
  ],
  imports: [ 
    CommonModule
  ],
  exports: [PopupComponent, ConfirmComponent],
 
})
export class CommonsModule { }
