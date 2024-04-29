import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations'

@Component({
  selector: 'app-notify-popup',
  templateUrl: './notify-popup.component.html',
  styleUrls: ['./notify-popup.component.scss'],
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
export class NotifyPopupComponent {
  @Output() popup = new EventEmitter<any>();
  @Input() modalText:string = "";
  @Input() modelHeadingText :string = "";
  removeRecord(){
    this.popup.emit(true);
  }
  closePopup(){
    this.popup.emit(false);
  }
}
