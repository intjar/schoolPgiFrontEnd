import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.scss']
})
export class DataFormComponent {
  upatedChildSno: number = 0;

  @Input() updatedSno:number
  @Input() pageNumber:number
  @Input() pageChange:boolean
  @Input() resultData:any;
  @Input() dataUniqueArray:any
  @Input() disabled:boolean = false
  @Input() domainObjectArray:any =[]
  isVisible: boolean = false;
  msg: string;
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  formValue:any
 deleteStatus:boolean;
 subQuestionNumber:number =0
  constructor(
    private surveyDataEntryService:SurveyDataEntryService,
    private toast: ToastService
    ){}

  ngOnInit(): void {
  }

  childUdpate() {

    return this.upatedChildSno + 1;
  }

  filterHeader(id: any) {
    // console.log("id", id)
    if(this.domainObjectArray?.length > 0 && this.resultData?.result_det?.length > 0){
      let response_data = this.resultData?.result_det;
      
      
        let serialCount = 1
    let subSerialCount = 1
    let outData = response_data?.filter(
      (res: any) => {
        if (res.sub_question_id == 0){
          res['indexNo']= res?.sno; 
          serialCount+=1;
          subSerialCount = 1
        }
        else {
          res['indexNo']=  res?.sno.toString() + '.' + subSerialCount; 
          res['third'] = res?.is_third_party
          subSerialCount+=1;
        }
        return res?.domain_id == id?.domain && res.sub_domain_id == id?.sub_domain}
    );
    return outData;
    }

  }

  loadForm(id: any): any {
    let response: any = this.filterHeader(id);
    return response;
  }
  updateIndexval(index: number) {
    this.updatedSno = index + 1;
    return this.updatedSno;
  }

  // updateSession(item: any, val: any) {
  //   this.getSessionValue();
  //   const findIndex = this.formValue.findIndex(
  //     (a) => a.item?.code == item?.code && a.value == val
  //   );
  //   findIndex !== -1 && this.formValue.splice(findIndex, 1);
  //   this.setStorage(this.formValue);
  // }
  // getSessionValue() {
  //   let session = sessionStorage.getItem('formval');
  //   this.formValue = session ? JSON.parse(session || '') : [];
  // }
   //Set Session Storage Items
   setStorage(formVal: any) {
    sessionStorage.setItem('formval', JSON.stringify(formVal));
  }
  serialNo(index:number){

    if(index == 0){
        let sno = index + 1
        this.subQuestionNumber = sno
        return  sno
    }
    else{
    let sno =  this.subQuestionNumber  + 1
      this.subQuestionNumber = sno
    return  sno 
    }    
   }

   subQuestionIndexing(index:number){
  

   }

}
