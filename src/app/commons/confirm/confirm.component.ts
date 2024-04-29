import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations'

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
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
export class ConfirmComponent {

  @Output() confirm = new EventEmitter<any>();

  changeQuestion(){
    this.confirm.emit(true);
  }
  closePopup(){
    this.confirm.emit(false);
  }

}
