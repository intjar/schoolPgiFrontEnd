import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { Common } from 'src/app/commons/common';
import { NgxPrintElementService } from 'ngx-print-element';
import { ToastService } from 'src/app/services/toast';
import { Router } from '@angular/router';
import { SideMenuService } from 'src/app/services/side-menu.service';
import * as moment from 'moment';

@Component({
  selector: 'data-entry-form',
  templateUrl: './data-entry-form.component.html',
  styleUrls: ['./data-entry-form.component.scss'],
})
export class DataEntryFormComponent {
  @Input() id!: number;
  isVisible: boolean = false;
  msg: string;
  @Output() back: any = new EventEmitter();
  resultData: any;
  dataUniqueArray: any = [];
  pageNumber: number = 0;
  childData: any = '';
  // dataentryGroup!: FormGroup;
  dataUniqueArrayWithoutSubQuestion: any = [];
  subDomainArry: any = [];
  domainSubDomain: any = [];
  updatedSno: number;
  upatedChildSno: number = 0;
  pageChange: boolean = false;
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  buttonType: string = '';
  isShowPopup:boolean = false
  displayStyle = 'none';
  popUpPage: number = 0

  payLoads:any;
  @Input()  status:any
  statusJson:any = Common.dataSurveyStatus;
  disableSubmitButton: boolean = false

  @Output() backToLevel:any  = new EventEmitter()
  @Input() startEndDate:any;
  @Input() instanceId:number
  disableFields:boolean = false;
  viewButtonModal:boolean = false


  timer:number  = Common.timeout;
  breadcrums = {
    heading: 'Survey Data Entry',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey Data Entry', current: true },
    ],
  };
  resultPopup:any =[]
  public config = Common.config;
  public scroll = Common.scroll
  isPDF:boolean = false
  currentTime: Date = new Date();
  isShowSubmit:boolean = false;
  domainObjectArray:any
  isLoading:boolean= false
  showSubmitPop:boolean = false
  type:string = ''
  isSurveyUpload:boolean= false
  constructor(
    private surveyDataEntryService: SurveyDataEntryService,
    private formBuilder: FormBuilder,
    public print: NgxPrintElementService,
    private toast: ToastService,private router: Router,public sideMenuService:SideMenuService
  ) {}

  ngOnInit(): void {
    this.clearSession();
    this.scroll(event,'commonScrollTo')
    this.router.url.includes('survey-data-upload') ? '' : this.sideBarUpdate(true)
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isSurveyUpload = this.router.url.includes('survey-data-upload')

    this.getSurveyById(this.id);

    let dateItems = this.startEndDate.split('To')

    var d1 = new Date();
    let format = 'yyyy-MM-DD'
    var toadayDate = moment(d1).format(format)
    var endDate =  moment(dateItems[1]).format(format)
    var startDate =  moment(dateItems[0]).format(format)
    // var endDate = new Date(dateItems[1]);
    //var startDate = new Date(dateItems[0]);

    if(((moment(startDate).isBefore(toadayDate) && moment(endDate).isBefore(toadayDate))) || (moment(startDate).isAfter(toadayDate) && !moment(endDate).isBefore(toadayDate)))
    {
      this.disableFields =true
    }
   
  }
  sideBarUpdate(type:boolean){

    this.sideMenuService.changePage(type);
  }
  backTo(){
    this.sideBarUpdate(false )
    this.clearSession();
    this.back.emit(true);
  }

  getSurveyById(id: number) {
    this.toast.dismissSnackBar()
    let data = {
      surveyId: id,
      isThird:  this.isSurveyUpload? 1 : 0,
      loginId:this.getSession?.uid,
      instanceId: this.instanceId
    };

    this.isLoading = true
    this.surveyDataEntryService.getDataListById(data).subscribe(
      (res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        
        let allItemsId: any = [];
        if (resJSON?.[0]) {
          this.resultData = resJSON?.[0];
          this.resultData['result_head'][0]['inst_id'] = this.instanceId
          this.resultPopup = this.resultData?.result_det

          this.payLoads = resJSON
          
          // let uniqueQuestionDomainid = [
          //   ...new Set(
          //     resJSON?.[0]?.result_det.map(
          //       (item) =>
          //       {return {'domain':item.domain_id,'subDomain':item.sub_domain_id}}
          //     )
          //   ),
          // ];

          //Filtered Subdomain
          resJSON?.[0]?.result_det.forEach((domSub: any) => {
            allItemsId.push({
              domain: domSub.domain_id,
              sub_domain: domSub.sub_domain_id,
            });
          });

          //Removed Duplicates Fomr Filltered Array
          this.domainSubDomain = allItemsId.filter(
            (thing, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.domain === thing.domain && t.sub_domain === thing.sub_domain
              )
          );

          const arrayUniqueByKey = [...new Map(this.domainSubDomain.map((item:any) =>
            [item['domain'] && item['sub_domain'] , item])).values()];

            this.domainObjectArray = arrayUniqueByKey

          this.dataUniqueArray = [
            ...new Set(
              resJSON?.[0]?.result_det.map(
                (item) => item.domain_id && item.sub_domain_id
              )
            ),
          ];


          this.dataUniqueArrayWithoutSubQuestion = [
            ...new Set(resJSON?.[0]?.result_det.map((item) => item.domain_id)),
          ];

          this.subDomainArry = [
            ...new Set(
              resJSON?.[0]?.result_det.map((item) => item.sub_domain_id)
            ),
          ];
          // //Filtered Subdomain
          // resJSON?.[0]?.result_det.forEach((domSub: any) => {
          //   allItemsId.push({
          //     domain: domSub.domain_id,
          //     sub_domain: domSub.sub_domain_id,
          //   });
          // });

          // //Removed Duplicates Fomr Filltered Array
          // this.domainSubDomain = allItemsId.filter(
          //   (thing, index, self) =>
          //     index ===
          //     self.findIndex(
          //       (t) =>
          //         t.domain === thing.domain && t.sub_domain === thing.sub_domain
          //     )
          // );

             this.isLoading = false
             this.type == 'submit' ?  (this.isShowPopup = true, this.type = '') : ''
            
        } else {

             this.isLoading = false
             this.type == 'submit' ?  (this.isShowPopup = false, this.type = '') : ''
             this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
      (error) => {
                     this.isLoading = false
                     this.type == 'submit' ?  (this.isShowPopup = false, this.type = '') : ''
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
  }

  filterHeader(id: any,) {
    let response_data = this.resultData?.result_det;


    // OLD CODE//
    // let outData = response_data?.filter(
    //   // (res: any) => res?.domain_id == id 
    //   (res: any) => res?.domain_id == id || res.sub_domain_id == id
    // );
    // this.childData = outData;

    // NEW LOGIC //

    let sub_domain_id=this.domainObjectArray?.at(id)?.sub_domain
    let domain_id=this.domainObjectArray?.at(id)?.domain
    let outData  = response_data?.filter(
        (res: any) => res?.domain_id == domain_id && res.sub_domain_id == sub_domain_id
      );
      this.childData = outData;
    
    return outData;
  }

  loadFormWithMultipleChild(id: number) {
    let response = this.filterHeader(id)?.filter(
      (res: any) => res?.doamin_id == id && res.sub_question_id != 0
    );
    return response;
  }

  loadSelectedDomain(domainId: number, subdomain: number) {
    let response_data = this.resultData?.result_det;
    let outData = response_data?.filter(
      (res: any) =>
        res?.domain_id == domainId && res.sub_question_id == subdomain
    );
    return outData;
  }

  loadFormWithMultiple(id: number) {
    let response = this.filterHeader(id)?.filter(
      (res: any) => res?.domain_id == id && res.sub_question_id != 0
    );
    return response;
  }

  loadForm(id: number): any {
    let response: any = this.filterHeader(id);
    return response;
  }

  updateIndexval(index: number) {
    this.updatedSno = index + 1;
    return this.updatedSno;
  }

  childUdpate() {
    return this.upatedChildSno + 1;
  }

  pagination(type: string) {
    let totalPages = this.dataUniqueArray.length - 1;

    if (type == 'next') {
      if (this.pageNumber <= totalPages) {
        this.pageNumber = this.pageNumber + 1;

      this.clearSession();
      this.getSurveyById(this.id)
      }
    }

    if (type == 'prev') {
      if (this.pageNumber <= totalPages) {
        this.pageNumber = this.pageNumber - 1;
        this.getSurveyById(this.id)
      }
    }
  }



  udpateAns(type: string) {

    let session: any = sessionStorage.getItem('formval')
      ? JSON.parse(sessionStorage.getItem('formval') || '')
      : null;
    if (session != null) {
      let payloads: any = [
        {
          result_head: this.resultData?.result_head,
          result_det: [],
        },
      ];
      payloads[0]['result_head'][0]['inst_id'] = this.instanceId
      payloads[0]['result_head'][0]['login_id'] = this.getSession?.uid;
      payloads[0]['result_head'][0]['event_name'] = 'S';


      //Filter Remove Checkbox
      let filterSession = session.filter(
        (res: any) => res?.item?.type != 'Check Box'
      );
      //Put object in payload
      filterSession.forEach((element: any) => {
        if (element?.value.length != 0 && element?.value.length != '') {
          element.item.answers = element?.value.toString().replace(/\,/g, '||');
          payloads[0]['result_det']?.push(element?.item);
        }
      });

      let filterMultiSelect = session.filter(
        (res: any) => res?.item?.type == 'Multiple Choice' || res?.item?.type == 'Drop Down' 
      );

      filterMultiSelect.forEach((element: any) => {
            element.item.answers = element?.value.toString().replace(/\,/g, '||');
          payloads[0]['result_det']?.push(element?.item);
        
      });
      let filterSingleSelect = session.filter(
        (res: any) => res?.item?.type == 'Drop Down'
      );

      filterSingleSelect.forEach((element: any) => {
            element.item.answers = element?.value;
          payloads[0]['result_det']?.push(element?.item);
        
      });
      let Single_Text_Box = session.filter(
        (res: any) => res?.item?.type == 'Single Text Box' && res?.value != ''
      );

      Single_Text_Box.forEach((element: any) => {
        element.item.answers = element?.value.toString().replace(/\,/g, '||');
      payloads[0]['result_det']?.push(element?.item);
    
  });


      // Only check Box
      let filterCheckobox = session.filter(
        (res: any) =>
          res?.item?.type == 'Check Box' ||
          res?.item?.type == 'Multiple Text Box'
      );

      //Concat Checkbox Value
      let result: any = Object.values(
        filterCheckobox.reduce((c, { item, value }) => {
          c[item.code] = c[item.code] || { item, value: [] };
          c[item.code].value = c[item.code].value.concat(
            Array.isArray(value) ? value : [value]
          );
          return c;
        }, {})
      );



      //Put Value Payload For Check Box
      result.forEach((element: any) => {
        if (element?.value.length != 0 && element?.value.length != '') {
          element.item.answers = element?.value.toString().replace(/\,/g, '||');
          payloads[0]['result_det']?.push(element?.item);
        }
      });

      payloads[0]['result_det'] = this.removeAllDuplicates(
        payloads[0]['result_det']
      );
      payloads[0]['result_det'] = this.removeSinglelDuplicates(
        payloads[0]['result_det']
      );


         // Only File Upload
        //  let filterUpload = session.filter(
        //   (res: any) => res?.item?.type == 'File Upload'  );




        this.saveSubmit(payloads,false , type)
    } else {
      if(type =='submit'){
        this.getSurveyById(this.id)
        this.clearSession();
        this.type = type
       
      }
      else{
        if(type == 'final'){
          this.backToLevel.emit(true)
          this.toast.showMessage('Successfully processed', '', 'success');
        }
        else{
          this.pagination(type);
        }
      }


    }


  }

  saveAndSubmit()
  {
    this.udpateAns('submit')
    this.isShowSubmit = true
  }
  onSelectQuestion(index:number)
  {
    this.pageNumber = index ;
    this.clearSession();
    this.getSurveyById(this.id)
  }


  fileToByteArray(file) {
    const reader: any = new FileReader();
    reader.onloadend = (e) => {
      let arrayBuffer: any = reader.result;
      let byteArray: any = new Uint8Array(arrayBuffer);
      // this.uploadedFile = byteArray;

    };
    reader.readAsArrayBuffer(file);
  }

  saveSubmit(payloads:any, issubmit:boolean , type:string)
  {

    if(issubmit)
    {
      this.payLoads = [
        {
          result_head: this.resultData?.result_head,
          result_det:this.resultData?.result_det
        },
      ];
      this.payLoads[0]['result_head'][0]['inst_id'] = this.instanceId
      this.payLoads[0]['result_head'][0]['login_id'] = this.getSession?.uid;
     this.payLoads[0]['result_head'][0]['event_name'] = 'C'
    }

    // console.log(this.payLoads )
    // console.log('===================================')
    // console.log(this.payLoads)

    if(payloads[0]?.result_det.length != 0){
      this.surveyDataEntryService.inserDataList(issubmit ? this.payLoads : payloads).subscribe(
        (res: any) => {
  
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
  
          if (resJSON?.success) {
            if(type != 'submit'){
            if(!issubmit)
            {
              this.dataUniqueArray.length-1 == this.pageNumber ? ''  : this.clearSession();
              this.pagination(type)
            }
            issubmit ? this.backToLevel.emit(true) : ''
  
            if(type == 'final'){
              this.backToLevel.emit(true)
              this.toast.showMessage('Successfully processed', '', 'success');
  
            }
  
  
          }
            if(type =='submit'){
              this.getSurveyById(this.id)
              this.clearSession();
              this.isShowSubmit = true
              this.isShowPopup = true
            }
  
          } else {
         
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          }
        },
        (error) => {
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
        }
      );
    }
    else
    {
      if(type != 'submit'){
        if(!issubmit)
        {
          this.dataUniqueArray.length-1 == this.pageNumber ? ''  : this.clearSession();
          this.pagination(type)
        }
        issubmit ? this.backToLevel.emit(true) : ''

        if(type == 'final'){
          this.backToLevel.emit(true)

        }


      }
    }
  
  }

  clearSession() {
    sessionStorage.removeItem('formval');
  }

  finalSubmit()
  {
    let results = structuredClone(this.resultData?.result_det)
    let totalResult =  results.filter((res:any)=> res?.is_mandatory  == 1 && res?.answers == "" && res?.type != 'Add Sub Question')
    if(totalResult?.length > 0){
      this.isShowPopup = false
        this.toast.showMessage('Please Fill Mandatory Fields / Third Party Questions are Pending!!', '', 'unsuccess')
     
    }  else{
      this.saveSubmit('', true , '')
    }
    
    
  }

  removeAllDuplicates(formVal: any) {
    return formVal.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) => t.code === value.code && t.answers === value.answers
        )
    );
  }
  removeSinglelDuplicates(formVal: any) {
    return formVal.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.code === value.code)
    );
  }

  updatePopupPage(type:string){
    if(type == 'next')
    {
      this.popUpPage = this.popUpPage + 1

    }
    if(type == 'prev')
    {
      this.popUpPage = this.popUpPage - 1

    }
  }


  inputCheck(event:any){

    this.disableSubmitButton = this.disableSubmitButton
  }
  closeViewModal(){
    this.viewButtonModal = false;
    this.displayStyle = "none";
  }
  export(event:any){
   this.genratePDF()
  }


  genratePDF()
  {
    this.isPDF = true
    setTimeout(() => {
      this.print.print('print-ans', this.config);
      this.isPDF = false
    }, 800);

  }

  percentageCount(Total:number , Submitted:number){
    let Percentage = Submitted / Total  
    return (Percentage * 100).toFixed(0)

  }

  getRoleName()
  {
    if(this.getSession.uid == 1){
      return true
    }
    else{
      return false
    }
  }

}
