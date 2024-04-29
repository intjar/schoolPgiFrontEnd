import { environment } from 'src/environments/environment';
import { P } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { UrlService } from 'src/app/services/url.service';
import { ToastService } from 'src/app/services/toast';
@Component({
  selector: 'app-cmn-form',
  templateUrl: './cmn-form.component.html',
  styleUrls: ['./cmn-form.component.scss'],
})
export class CmnFormComponent {
  dataentryGroup:any = FormGroup;
  fieldControlName = {
    dropdown: null,
    checkbox: '',
    date: '',
    multiSelect: [null],
    ans: '',
    multipleAns:[null]
  };

  @Input() items: any = [];
  @Input() Index!: number;
  @Input() pageChange: boolean = false;
  @Output() giveValue: any = new EventEmitter();
  @Input() disabled: boolean = false;
  formValue: any = [];
  isUpdate: boolean = false;
  updateItem: string = '';
  @ViewChild('file')
  file!: ElementRef;
  fileUploadAllowed: string = '.jpg,.jpeg,.png,.xls,.pdf,.xlsx';
  isVisible: boolean = false;
  msg: string;
  uploadedFile: any = [];
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  filePath: any;
  @Output() delete: any = new EventEmitter();
  @Input() deleteStatus: boolean;
  @Input() resultData: any;
  selectedIndex:number
  basePath:any =environment.baseURLfileUpload
isLoading:boolean = false
  errorMultiple:any
  constructor(
    private formBuilder: FormBuilder,
    private surveyDataEntryService: SurveyDataEntryService,
    public urlService: UrlService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
  //  this.toast.showMessage('Only JPG,JPEG,PNG,PDF,XLS,XLSX  file allowed', '', 'unsuccess');

    // sessionStorage.removeItem('formval');
    console.log('this.items', this.items)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (this.pageChange === true) {
      }
      this.dataentryGroup = this.formBuilder.group({
        dropdown: null,
        checkbox: [''],
        date: [''],
        multiSelect: [null],
        ans: [''],
      });
      if (this.items?.value != '') {
        this.getPrefilledValue();
      }
    }
  }

  //Get Prefilled Value
  getPrefilledValue() {
    let items = this.items;
    let session = sessionStorage.getItem('formval');
    this.formValue = session ? JSON.parse(session || '') : [];
    if (items.answers != '') {
      this.dataentryGroup.patchValue({
        dropdown: items.answers,
        multiSelect:items.answers?.split('||') ,
        // ans: items.answers,
        date: items.answers,
      });

      //For Checkboxes
      if (items?.type == 'Check Box') {
        this.formValue = session ? JSON.parse(session || '') : [];

        this.dataentryGroup.patchValue({
          checkbox: items?.answers?.split('||'),
        });
        for (let box of items?.answers?.split('||')) {
          this.formValue.push({ item: this.items, value: box });
        }
        this.formValue = this.removeAllDuplicates(this.formValue);
        if (this.formValue.length != 0) {
          this.setStorage(this.removeAllDuplicates(this.formValue));
        }
      }

      //For Upload File
      if (items?.type == 'File Upload') {
          this.filePath = { filePath: items.answers, file_id:items.file_id};
      }
    }

    //For Multiple CHoice
    if (items?.type == 'Multiple Choice') {
      this.formValue = session ? JSON.parse(session || '') : [];
      if(items.answers != ""){
      this.dataentryGroup.patchValue({
        multiSelect:items.answers?.split('||') ,
      });
      this.formValue.push({
        item: this.items,
        value: this.dataentryGroup.controls['multiSelect'].value,
      });
      this.setStorage(this.removeAllDuplicates(this.formValue));
    }
    }

    if (items?.type == 'Single Text Box') {
      this.dataentryGroup.patchValue({
        ans: items.answers
      });
    }
  }

  //For Dropdown
  dropdownchange(item: any, val: any) {
    const Items = this.dataentryGroup.controls['dropdown'].value;
    this.filterItems(item, val);
    this.formValue.push({ item: item, value: Items });
    this.setStorage(this.formValue);
  }
  //For Date Change
  datechange(item: any, val: any) {
    //Get date value
    const Items = this.dataentryGroup.controls['date'].value;
    this.filterItems(item, val);
    this.formValue.push({ item: item, value: Items });
    this.setStorage(this.formValue);
  }

  //For Checkbox
  checkBox(item: any, val: any) {
    const Items = this.dataentryGroup.controls['checkbox'].value;
    this.getSessionValue();
    if (val?.target?.checked) {
      //Set Items In Session
      this.formValue.push({ item: item, value: val?.target?.value });
      this.setStorage(this.formValue);
    } else if (!val?.target?.checked) {
      //Remove Duplicate Value
      const findIndex = this.formValue.findIndex(
        (a) => a.value == val?.target?.value
      );
      findIndex !== -1 && this.formValue.splice(findIndex, 1);
      this.setStorage(this.formValue);
    }
  }

  //ForMultiselect
  multiItems(item: any, val: any) {
    const Items = val;
    this.filterItems(item, val);
      this.formValue.push({ item: item, value: Items });

    this.setStorage(this.formValue);
  }

  showTitle(item: any) {
    let title: any = []
    item.slice(1, item.length)?.forEach((element) => {
      title.push(element)
    });
    return title.join('\n')
  }

  //For Single Text
  singleTextBox(item: any, val: any) {
    const Items = val?.target?.value;
    this.filterItems(item, Items);
    this.formValue.push({ item: item, value: Items });
    this.setStorage(this.formValue);
  }

  //For MultipleText Bixes
  multipleTextBoxes(item: any, val: any, name: string, index: number) {
    const Items = val?.target?.value;

    if(item?.is_mandatory == 1 && Items == '')
    {
       this.errorMultiple=index
    }
    else{
      this.errorMultiple=null
      
      if(Items != ''){
  
      this.getSessionValue();
      this.removeAllDuplicates(this.formValue);
      // this.filterItems(item, Items);
      this.formValue.push({
        item: item,
        value: name + '|' + Items,
        index: index,
      });
      this.setStorage(this.formValue);
  
      this.isUpdate ? this.removeFromLocal(item, name, val, index) : '';
    }
    }
    
  }

  filterItems(item: any, val: any) {
    this.getSessionValue();
    const findIndex = this.formValue.findIndex(
      (a) => a.item?.code == item?.code
    );
    findIndex !== -1 && this.formValue.splice(findIndex, 1);
  }

  //Set Session Storage Items
  setStorage(formVal: any) {
    sessionStorage.setItem('formval', JSON.stringify(formVal));
    // setTimeout(() => {
    //   this.isUpdate = false;
    // }, 500);
  }

  updateSession(item: any, val: any) {
    this.getSessionValue();
    const findIndex = this.formValue.findIndex(
      (a) => a.item?.code == item?.code && a.value == val
    );
    findIndex !== -1 && this.formValue.splice(findIndex, 1);
    this.setStorage(this.formValue);
  }

  updateMultiValue(item: any, index: number) {
    if (!this.isUpdate) {
      let latItems: any = [];
      this.items.answers?.split('||').forEach((element: any) => {
        latItems.push(element);
      });

      //Return Value in
      if (latItems[index]?.split('|')[0] == item) {
        //Update Session Varaible
        this.getSessionValue();
        this.formValue.push({
          item: this.items,
          value: item + '|' + latItems[index]?.split('|')[1]?.toString(),
          index: index,
        });
        this.setStorage(this.removeAllDuplicates(this.formValue));
      }
      return latItems[index]?.split('|')?.[1]?.toString();
    }
  }

  uploadFile(event: any) {
    this.isLoading = true
    const files = this.file?.nativeElement?.files;
   
    if(files?.length != 0){
      if (files[0]?.size > 200000000) {
        this.isLoading = false
    this.toast.showMessage('File must be less than 200MB', '', 'unsuccess');
  } else if (

    files?.length > 0 &&
    this.fileUploadAllowed?.indexOf(files[0]?.name?.split('.')[1]) == -1
  ) {
              this.isLoading = false
              this.filePath =''
    this.toast.showMessage('Only JPG,JPEG,PNG,PDF,XLS,XLSX  file allowed', '', 'unsuccess');
  } else {

    const formData: any = new FormData();
    formData.append('files', files[0] as File);
    formData.append('categoryId', 1);
    formData.append('loginId', this.getSession?.uid);

    this.surveyDataEntryService.uploadFiles(formData).subscribe(
      (res: any) => {
        if (res?.success) {
          this.filePath = {
            filePath: res?.result?.filePath,
            file_id: res?.result?.id,
          };
        this.isLoading = false
          this.udpateAns(this.items, false)
        } else {
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        this.isLoading = false
        }
      },
      (error) => {
                  this.isLoading = false
        let message = 'Something went wrong!!'
        this.toast.showMessage(message, '', 'unsuccess');
      }
    );

  }
    }
    else{
      this.isLoading = false
      this.filePath =''
    }
    
  }



  saveFileSession(fileData: any) {
    this.getSessionValue();
    this.formValue.push({
      item: this.items,
      value: fileData,
    });
    this.setStorage(this.formValue);
  }


  removeFromLocal(items: any, item: any, val: any, index: number) {
    this.isUpdate = true;
    this.updateItem = item;
    this.getSessionValue();
    const indexOfObject = this.formValue.findIndex((object) => {
      return object.index == index;
    });
    this.formValue.splice(indexOfObject, 1);
    this.setStorage(this.formValue);
  }

  removeAllDuplicates(formVal: any) {
    return formVal.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) => t.item.code === value.item.code && t.value === value.value
        )
    );
  }
  getSessionValue() {
    let session = sessionStorage.getItem('formval');
    this.formValue = session ? JSON.parse(session || '') : [];
  }
  clearSession() {
    sessionStorage.removeItem('formval');
  }

  udpateAns(item:any, fileDelete:boolean) {
   
      let payloads: any = [
        {
          result_head: this.resultData?.result_head,
          result_det: [item],
        },
      ];
      payloads[0]['result_head'][0]['inst_id'] =  this.resultData?.result_head?.[0]?.inst_id
      payloads[0]['result_head'][0]['login_id'] = this.getSession?.uid;
      payloads[0]['result_head'][0]['event_name'] = 'S';
      payloads[0]['result_det'][0] = item
      payloads[0]['result_det'][0]['answers'] = fileDelete? "" : this.filePath.filePath

      this.surveyDataEntryService.inserDataList(payloads).subscribe(
        (res: any) => {
          let resSTR = JSON.stringify(res);
          let resJSON = JSON.parse(resSTR);
          if (resJSON?.success) {
            // fileDelete? this.filePath = {} :''
            // this.toast.showMessage(resJSON?.message, '', 'success');
                    this.isLoading = false
          } else {
            this.filePath = ''
            this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
                    this.isLoading = false
          }
        },
        (error) => {
          this.toast.showMessage('Something went wrong', '', 'unsuccess');
                  this.isLoading = false
        }
      );
  }

  deleteMediaFiles(imgObject:any)
  {
        this.isLoading = true
    let items = {
       id:this.filePath?.file_id ?this.filePath?.file_id : imgObject?.file_id,
      loggedInUserId: this.getSession?.uid
      }

    this.surveyDataEntryService.deleteMedia(items).subscribe((res:any)=>{
      if(res?.success)
      {
        // this.toast.showMessage(res?.message, '', 'success');
        this.filePath = null
        this.udpateAns(this.items,true)

      }
      else{
        this.toast.showMessage(res?.message, '', 'unsuccess');
            this.isLoading = false
      }
    },
    (error)=>{
              this.isLoading = false
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })

  }

  gefileName(filename:string)
  {
    return filename.replace(/^.*[\\\/]/, '')
  }


}
