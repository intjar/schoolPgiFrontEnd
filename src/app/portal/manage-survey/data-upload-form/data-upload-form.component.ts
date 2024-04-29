import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { SurveyDataUploadService } from 'src/app/services/survey-data-upload.service';
import { ToastService } from 'src/app/services/toast';
import { environment } from 'src/environments/environment';
import * as fileSaver from 'file-saver';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
@Component({
  selector: 'data-upload-form',
  templateUrl: './data-upload-form.component.html',
  styleUrls: ['./data-upload-form.component.scss'],
})
export class DataUploadFormComponent {
  displayStyle = 'block';
  @Input() id!: number;
  @Output() back: any = new EventEmitter();
  @Input() result: any;
  @Input() unique: any;
  @Input() domainObjectArray: any;
  @Input() disabled: boolean = false;
  @ViewChild('file') file!: ElementRef;
  fileUploadAllowed: string = '.xlsx';
  uploadArr: any[] = [];
  files: any[] = [];
  isSelectedFile: boolean = true;
  formData: any;
  isOpenModal2: boolean = false;
  isOpenModal: boolean = false;
  isOpenDownloadModal: boolean = false;
  isShowButton : boolean = true
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  isLoading: boolean = false;
  basePath: any = environment.baseURLfileUpload
  breadcrums = {
    heading: 'Survey Data Upload',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey Data Upload', current: true },
    ],
  };
  pageNumber: number = 0;
  totalCount: number = 0;
  isUpload: boolean;
  isload:boolean = false;
  displayedColumns = ['sn', 'domain', 'subdomain', 'qusetiontype', 'qusetiontcode', 'qusetiontname', 'answertype','answer', 'Errors'];
  dataSource = new MatTableDataSource<any>();
  isLoader:boolean = false;
  isDataLoader:boolean = false;
  @ViewChild(MatPaginator) viewtable: MatPaginator;

   // Define a selection object to keep track of selected checkboxes
   selection: any[] = [];

  constructor(
    private surveyDataUploadService: SurveyDataUploadService,
    private toast: ToastService,
    private surveyDataEntryService: SurveyDataEntryService,
    private router: Router
  ) { }

  ngOnChanges() {
    if(this.result?.result_det?.length > 0){
      this.result?.result_det.forEach(item => item.isChecked = false);
      this.isDataLoader = false;
    }else{
      this.isDataLoader = true;
    }
  }

  filterHeader(id: any) {
    // console.log("this.result?.result_det", this.result?.result_det);
    
    if (
      this.domainObjectArray?.length > 0 &&
      this.result?.result_det?.length > 0
    ) {
      this.isDataLoader = false;
      let response_data = this.result?.result_det;
      let serialCount = 1;
      let subSerialCount = 1;
      let outData = response_data?.filter((res: any) => {
        if (res.sub_question_id == 0) {
          serialCount += 1;
          subSerialCount = 1;
        } else {
          res['indexNo'] = res.sno.toString() + '.' + subSerialCount;
          subSerialCount += 1;
        }
        return (
          res?.domain_id == id?.domain && res.sub_domain_id == id?.sub_domain
        );
      });
      return outData;
    }
  }

  loadForm(id: number, checkTypeAndData?:any): any {
    let response: any = this.filterHeader(id);
    if(checkTypeAndData?.checkedType === 'allChecked'){
      response.forEach(item => {
        item.isChecked = checkTypeAndData.status
      });
    }
    else if(checkTypeAndData?.checkedType === 'singleChecked'){
      if(!response[checkTypeAndData?.InstanceIndex]?.isChecked){
        response[checkTypeAndData?.InstanceIndex].isChecked = checkTypeAndData?.status
      }else{
        response[checkTypeAndData.InstanceIndex].isChecked = checkTypeAndData?.status;
      }
    }
    return response;
  }

  async downLoadexcel() {
    this.isLoader = true
    let payloads = this.getPayLoads()
    this.surveyDataUploadService.downloadSurveyExcel(payloads).subscribe(
      (res: any) => {
        console.log('res',res)
        if (res?.success) {
          let payloadData = {
            file_name: res.fileurl
          }
          this.surveyDataUploadService.downloadExcel(payloadData).subscribe((data: any) => {
            console.log(data);
            const downloadLink = document.createElement('a');
            const fileName = res.fileurl;
            downloadLink.href = `data:application/octet-stream;base64,${data.result}`;
            downloadLink.download = fileName;
            downloadLink.click();

          });
          this.isLoader = false
        }
        else {
          this.isLoader = false
          this.toast.showMessage('No File Found!!', '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false;
        this.isLoader = false
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );
  }

  async download(data: any) {
    // let location = window.location.origin
    // let localPath = location.includes('localhost')
    // let devPath = location.includes('spgi-dev')
    // let path = ''

    // console.log('basePath', this.basePath)
    // //path = this.basePath + '/download/'+ data?.fileurl

    // path = this.basePath + '/downloadExcel'
    // //  if(localPath || devPath){
         
    // //  }
    // //  else{
    // //   path = this.basePath +'/'+ data?.fileurl
    // //  }
    
 
    
    // fileSaver.saveAs(path, data?.fileurl);




    let payloads = this.getPayLoads();   
    this.surveyDataUploadService.downloadExcel(payloads).subscribe(
      (res: any) => {       
        if (res?.success) {
          console.log('response', res)
          // let path = this.basePath + res?.fileurl
          // console.log(path)

          this.download(res)
          this.isLoader = false
          // window.open(this.basePath + res.fileurl, '_blank')
        }
        else{
          this.isLoader = false
          this.toast.showMessage('No File Found!!', '', 'unsuccess');
        }
      },
      (error) => {
        this.isLoading = false;
        this.isLoader = false
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );

  }

  
  uploadExcel() {
    let payloads = this.getPayLoads()
    this.surveyDataUploadService.uploadExcel(payloads).subscribe(
      (res: any) => {
        
      },
      (error) => {
        this.isLoading = false;
        this.toast.showMessage('Something went wrong', '', 'unsuccess');
      }
    );

  }


  getPayLoads() {
    return {
      surveyId: this.id,
      loggedInUserId: this.getSession?.uid,
      instanceId: this.result?.result_det?.[0]?.instance_id
    }
  }


  selectFile(event: any) {
    this.uploadArr = event.target.files
    this.isLoading = true;
    const files = this.file?.nativeElement?.files;


    if ( this.uploadArr?.length != 0) {
      if (this.uploadArr[0]?.size > 200000000) {
        this.isLoading = false
        this.toast.showMessage('File must be less than 200MB', '', 'unsuccess');
      } else if (  this.uploadArr?.length > 0 && this.fileUploadAllowed?.indexOf(this.uploadArr[0]?.name?.split('.')[1]) == -1) {
        this.isLoading = false
        this.uploadArr = []
        this.toast.showMessage('Only XLSX  file allowed', '', 'unsuccess');
      }
      else {
        this.isSelectedFile = false;
        this.formData = new FormData();
        this.formData.append('file',   this.uploadArr[0] as File);
        this.formData.append('instanceId', this.result?.result_det?.[0]?.instance_id);
      }
    }
    else {
      this.isLoading = false
      this.uploadArr = []
    }
  }


  uploadFile(event: any, action: string) {
    if (this.uploadArr?.length != 0) {

      if (action == 'file') {
        this.isUpload = false;
        this.isOpenModal = false;
      }
      else if (action == 'table') {
        this.isOpenModal2 = true;   
        this.isUpload = true;
      }
      let obj = {
        'surveyId': this.result?.result_head[0]?.survey_id,
        'loginUserid': this.getSession?.uid,
        'isUpload': this.isUpload,
      }

      this.surveyDataEntryService.getuploadsurveyexcel(this.formData, obj).subscribe((res: any) => {
        console.log('res?.result', res.result)
        if (res?.success) {
          let error
            res?.result.filter((item:any)=> {
               error = item?.errorMessage
            })
            if(error){
              this.toast.showMessage(error, '', 'unsuccess');
            }else{
              this.dataSource = new MatTableDataSource<any>(res?.result);
              let totalResult =  res?.result.filter((response:any)=> response?.error?.length > 0 )
              totalResult.length  > 0 ?  (this.isShowButton = true) : (this.isShowButton = false)  
              this.isLoading = false
              this.isOpenModal2 = true;              
              if (action == 'table') {
                this.isload = true;
                this.isOpenModal2 = false; 
                this.toast.showMessage(res?.message, '', 'success');
                setTimeout(()=>{
                  this.isload = false;
                  this.back.emit(true);
                },1000)
               
              }

            }           
        } else {
          this.isSelectedFile = true;
          this.isLoading = false
          this.toast.showMessage(res?.result[0]?.errorMessage, '', 'unsuccess');

        }
      },
        (error) => {
          this.isLoading = false
          let message = 'Something went wrong!!'
          this.toast.showMessage(message, '', 'unsuccess');
        });
    }
    else {
      this.isLoading = false
      this.toast.showMessage('File not uploaded!!', '', 'unsuccess');
    }

  }

  removefile() {
    this.isSelectedFile = true;
    this.uploadArr = []
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex;

    // this.payLoadsViewUser['pageNo'] = this.pageNumber;
    // this.payLoadsViewUser['search'] = this.searchValue.toLowerCase();
  }
  replaceString(item:any){
    if(item.includes('/media_upload/'))
    {
      return this.basePath + item
    }
    else if(item.includes('000Z')){
  return (new Date(item) instanceof Date)
    }
    else{
      return item?.split('||').toLocaleString()
    }

  }

  // Toggle selection of all checkboxes
  toggleAllSelection(ev:any, index: number) {
    let data = 
    {
      checkedType: 'allChecked',
      status: ev.target.checked
    }
    this.loadForm(this.domainObjectArray[index], data );
  }

  toggleSelection(ev:any, domainObjectArrayIndex: number, InstanceIndex: number){
    let data = 
    {
      checkedType: 'singleChecked',
      status: ev.target.checked,
      InstanceIndex: InstanceIndex
    }
    this.loadForm(this.domainObjectArray[domainObjectArrayIndex], data);
  }

}
