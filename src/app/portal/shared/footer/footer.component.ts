import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  displayStyle = "none";
  constructor(private dataservice : DataService){}

   removeRecord() {
  //   this.dataservice.addRoleMasterDeleteRole(this.ID).subscribe(res => {
  //     let resSTR = JSON.stringify(res);
  //     let resJSON = JSON.parse(resSTR);
  //     if (resJSON.success == true) {
  //       this.roleReport();
  //       this.displayStyle = "none";
  //     }
  //   })
   }
  closePopup() {
    this.displayStyle = "none";
  }
}
