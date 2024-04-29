import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations'
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translate(0px, -50px)'}),
        animate('0.3s ease-out', style({transform: 'translate(0px)'}))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({transform: 'translate(0px, -50px)'}))
      ])
    ])
  ]
  
})
export class PopupComponent {

  @Output() popup = new EventEmitter<any>();

  removeRecord(){
    this.popup.emit(true);
  }
  closePopup(){
    this.popup.emit(false);
  }

}
