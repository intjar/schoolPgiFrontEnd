import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-record-found',
  templateUrl: './no-record-found.component.html',
  styleUrls: ['./no-record-found.component.scss']
})
export class NoRecordFoundComponent {
  @Input() height:string
  showMSG : string
  ngOnInit() {
    this.showMSG = 'No data found'
  }
}
