import { Component, Input } from '@angular/core';

@Component({
  selector: 'view-mapped-questions',
  templateUrl: './view-mapped-questions.component.html',
  styleUrls: ['./view-mapped-questions.component.scss']
})
export class ViewMappedQuestionsComponent {
  @Input() result:any
  @Input() unique:any;
  @Input() popup: boolean = false;
  @Input() fieldShow: boolean = false;
  @Input() formDataEntry:boolean = false;
  @Input() domainObjectArray:any =[]
  subQuestionNumber:number =0
  sub
  calculation: any = [
    {key:'Weight', value: 20},
    {key:'Calculated Value', value: 39},
    {key:'Points', value: 7.8},
    {key:'Data Source', value: 'NAS'}


]


  filterHeader(id: any) {
    let response_data = this.result;
      let serialCount = 1
    let subSerialCount = 1
    let outData = response_data?.filter(
      (res: any) => {
        if (res.sub_question_id == 0){
          res['indexNo']=res?.sno; 
          serialCount+=1;
          subSerialCount = 1
        }
        else {
          res['indexNo']= res?.sno.toString() + '.' + subSerialCount; 
          subSerialCount+=1;
        }
        return res?.domain_id == id?.domain && res.sub_domain_id == id?.sub_domain}
    );
    return outData;
  }

  loadForm(id: number): any {
    let response: any = this.filterHeader(id);
    return response;
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


}
