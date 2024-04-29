import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MediaFileUploadService } from 'src/app/services/media-file-upload.service';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { UrlService } from 'src/app/services/url.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-media-file-upload',
  templateUrl: './media-file-upload.component.html',
  styleUrls: ['./media-file-upload.component.scss'],
})
export class MediaFileUploadComponent implements OnInit {
  displayedColumns = ['sn', 'fileName', 'uploadedBy', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('file') uploadfiles: any;

  fileUploadForm: FormGroup
  categoryArr: any = [];
  createdById;
  isVisible: boolean = false;
  msg: string;
  categoryN: any
  categoryID;
  myfile: any = []
  uploadedFile: any;
  selectedItemArr: any = []
  displayStyle = "none";
  // byteData: any = [];
  @ViewChild('file')
  file!: ElementRef;
  fileUploadAllowed: string = '.jpeg,.jpg,.png,.xls,.xlsx,.pdf';
  isSubmitted: boolean = false;
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  files: any[] = [];
  fileName: string = '';
  totalCount: number = 0;
  pageNumber: number = 0
  isShowPopup: boolean = false;
  removeID: any;
  isLoading: boolean = true;
  dataSourceMedia: any;
  uploadArr: any[] = [];
  printDataSource: any[] = [];
  printPage: any = Common;
  pdfOpen: boolean = false;
  public config = Common.config;
  timer: number = Common.timeout;
  mediaFileData: any;
  searchFilter: string = "";
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Master Setting' },
      { link: 'Media File Uplaod', current: true },
    ],
  };
  basicSchoolPayloads: any;
  isGenerating: boolean = false;
  searchValue: string = '';
  isUploading: boolean = false
  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    public surveyDataEntryService: SurveyDataEntryService,
    private mediaFileUploadService: MediaFileUploadService,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private _changeDetectorRef: ChangeDetectorRef,
    private urlService: UrlService,
    private toast: ToastService) {
    this.fileUploadForm = this.formBuilder.group({
      category: new FormControl(null, [Validators.required]),
      // upload: new FormControl(null, [Validators.required])
    })
    this.createdById = (sessionStorage.getItem("userId"));

  }
  payLoadsViewUser: any;
  ngOnInit() {
    this.toast.dismissSnackBar();
    this.basicSchoolPayloads = {
      pageNo: 0,
      sortOrder: 'asc',
      search: '',
    };

    this.getMedia('page', this.basicSchoolPayloads)
    this.viewCategory()
  }

  sortData() {
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => { return typeof data[sortHeaderId] == 'string' ? data[sortHeaderId].toString().toLocaleLowerCase() : data[sortHeaderId] };
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  selectCategory(val) {
    this.categoryN = val?.categoryName
    this.categoryID = val?.categoryId
  }

  closePopup() {
    this.displayStyle = "none";
  }

  viewCategory() {
    this.dataService.getCategory().subscribe((res) => {
      let resSTR = JSON.stringify(res);
      let resJSON = JSON.parse(resSTR);
      resJSON?.result?.forEach(element => {
        this.categoryArr.push(element)
      });
    })
  }


  openFile(filePath: string) {
    let resultPath = this.dataSource.filteredData
    window.open(`${environment.baseURLfileUpload}${filePath}`, '_blank')

  }

  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      // sortOrder: 'asc',
      search: this.searchValue.toLowerCase(),
      pageSize: this.totalCount,
    };
    this.getMedia(type, payLoads);
  }

  getMedia(type: string, payLoads: any) {
    let data = {
      id: this.getSession?.uid
    }
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : '';

    this.printDataSource = [];
    this.dataService.getMediaFiles(payLoads, data).subscribe((res: any) => {

      let resJSON = res;
      if (resJSON?.success) {
        let dataSource = resJSON?.result;
        this.mediaFileData = dataSource?.result;
        this.printDataSource = structuredClone(dataSource?.result);
        if (type == 'page') {
          (this.dataSource = new MatTableDataSource<any>(dataSource?.result)),
            (this.isLoading = false),
            (this.totalCount = dataSource?.totalElements);
        }

        //Export PDF
        if (type === 'pdf') {
          this.isGenerating = true
          this.pdfOpen = true;
          setTimeout(() => {
            this.print.print('print-pdf', this.config);
            this.pdfOpen = false;
            this.isGenerating = false
          }, 500);
        }
        //Export CSV
        if (type === 'csv') {
          this.isGenerating = true
          const headers: any = [
            'File Name',
            'Uploaded By',
            'Date & Time'
          ];
          let itemData = structuredClone(this.printDataSource);

          itemData.forEach((element: any) => {
            element['File Name'] = element?.fileName
            element['Uploaded By'] = element?.user?.name
            element['Date & Time'] = new Date(element?.createdAt).toLocaleDateString("en-US")
          });
          setTimeout(() => {
            this._ExcelService.downloadFile(
              itemData,
              'Media_file_upload',
              headers
            );
            this.isGenerating = false
          }, 500);
        }
        // this.sortData();
      }
      else {
        this.isLoading = false;
        this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
      }
      this.isLoading = false;
    }, (error) => {
      // console.log(error)
      this.isLoading = false;
      // let message = 'Something went wrong!'
      this.toast.showMessage('Something went wrong!', '', 'unsuccess')
    })
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex
    // console.log(event?.pageIndex)
    // this.payLoadsViewUser['pageNo'] = this.pageNumber;
    let payLoads = {
      pageNo: this.pageNumber,
      sortOrder: 'asc',
      search: '',
    };
    this.getMedia('page', payLoads)
  }

  filterData(type: string) {
    this.pageNumber = 0;
    let payloads = {
      pageNo: 0,
      sortOrder: 'asc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    type == 'clear' ? (this.searchValue = '') : '';

    this.getMedia('page', payloads);
  }


  // submit() {
  // let message
  // setTimeout(() => {
  //   let items: any = []
  //   this.myfile?.forEach((res: any) => {
  //     var arry = [].slice.call(res.byte)
  //     items.push({
  //       categoryId: this.categoryID,
  //       categoryName: this.category,
  //       fileName:  res?.file.name,
  //       fileType: res?.file.type,
  //       file: arry,
  //       createdBy: parseInt(this.createdById)
  //     })
  //   })

  //   console.log(items)
  //   let data = {
  //     "categoryId": this.categoryID,
  //     "categoryName": this.category,
  //     "fileName": this.myfile[0].name,
  //     "fileType": this.myfile[0].type,
  //     "file": this.myfile, //this.byteData,
  //     "createdBy": parseInt(this.createdById)
  //   }
  //   console.log("data", data);
  //   this.dataService.mediaUploadFile(items).subscribe((res) => {
  //     let resSTR = JSON.stringify(res);
  //     let resJSON = JSON.parse(resSTR)
  //     console.log(resJSON)
  //     if (resJSON?.success == true) {
  //       message = "File uploaded successfully"
  //       this.showAlert(message)
  //       this.fileUploadForm.reset()
  //       this.getMedia()
  //     } else {
  //       message = resJSON?.errorMessage
  //       this.showAlert(message)
  //     }
  //   })

  // }, 500);
  // }

  // showAlert(data) {
  //   if (this.isVisible) {
  //     return;
  //   }
  //   this.isVisible = true;
  //   this.msg = data
  //   setTimeout(() => this.isVisible = false, this.timer)
  // }

  // fileToByteArray(file) {
  //   const reader: any = new FileReader();
  //   reader.onload = (e) => {
  //     const arrayBuffer: any = reader.result;
  //     const byteArray: any = new Uint8Array(arrayBuffer);
  //     this.byteData.push({ file: file, byte: byteArray })
  //     return byteArray
  //   };
  //   reader.readAsArrayBuffer(file);
  // }

  // filePreview() {
  //   this.files = Array.from(this.file?.nativeElement?.files)
  //   this.files.forEach((item: any) => {
  //     this.uploadArr.push(item)
  //   })
  //   // this.uploadArr.concat(this.files)
  //   if (this.uploadArr.length > 10) {
  //     this.showAlert("Maximum 10 files are allowed")
  //     // this.uploadArr = [];
  //     // this.file.nativeElement.value = null
  //   }

  // }

  onChange(event: any) {
    if (event.target.files.length + this.uploadArr?.length > 10) {
      this.toast.showMessage("Maximum 10 files are allowed", '', 'success')
      return;
    }

    this.files = [].slice.call(event.target.files);
    // this.files.push(event.target.files)
    this.files.forEach((file) => {
      let found = false;
      for (let i = 0; i < this.uploadArr.length; i++) {
        if (file.name == this.uploadArr[i].name) {
          found = true;
          break;
        }
      }
      if (!found) this.uploadArr.push(file);
    });

    if (this.uploadArr.length > 10) {
      this.toast.showMessage("Maximum 10 files are allowed", '', 'success')
    }


  }

  removefile(index) {
    this.uploadArr.splice(index, 1)
  }

  uploadFile(event: any) {
    this.isSubmitted = true;
    if (this.uploadArr?.length == 0) {
      return
    }

    if (this.fileUploadForm.invalid) {
      return
    }
    else {
      let countFiles: any = 0
      this.isUploading = true
      const files = this.uploadArr
      this.uploadArr.forEach(element => {
        countFiles += element.size
      });
      if (countFiles > 200000000) {
        this.isUploading = false
        this.toast.showMessage('File must be less than 200MB', '', 'success');
      } else if (
        files?.length > 0 &&
        this.fileUploadAllowed?.indexOf(files[0]?.name?.split('.')[1]) == -1
      ) {
        this.isUploading = false
        this.toast.showMessage('Only XLS,JPG,JPEG,PNG,PDF file allowed', '', 'success');
      }
      else {
        const formData: any = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        // formData.append('files', files as File);
        formData.append('categoryId', this.categoryID);
        formData.append('loginId', this.getSession?.uid);

        this.surveyDataEntryService.uploadFiles(formData).subscribe((res: any) => {
          this.isSubmitted = false;
          if (res?.success == true) {
            this.toast.showMessage("Media file uploaded successfully", '', 'success')
            this.fileUploadForm.reset()
            this.files = []
            this.uploadArr = []
            this.uploadfiles.nativeElement.value = ""
            this.pageNumber = 0
            let payLoads = {
              pageNo: this.pageNumber,
              sortOrder: 'asc',
              search: '',
            };
            this.getMedia('page', payLoads)
            this.searchFilter = "";
            this.isUploading = false
          } else {
            this.isSubmitted = false;
            this.isUploading = false
            // let message: string = resJSON?.errorMessage
            this.toast.showMessage(res?.errorMessage, '', 'unsuccess')
          }
        }, (error) => {
          this.isSubmitted = false;
          this.isUploading = false
          // let message = 'Something went wrong!'
          this.toast.showMessage('Something went wrong!', '', 'unsuccess')
        })



      }

      // this.myfile = files

      //Convert Files to Byte array
      // var arry = [].slice.call(files)
      // arry.forEach((res: any) => { this.fileToByteArray(res); })
    }
  }

  onCancel() {
    this.isSubmitted = false;
    this.fileUploadForm.reset()
    this.uploadfiles.nativeElement.value = ""
    this.files = []
    this.uploadArr = []
  }

  remove(selectItem) {
    this.isShowPopup = true;
    this.removeID = selectItem;
  }

  removeRecord(item) {
    if (item) {
      this.isGenerating = true
      let data = {
        "id": this.removeID?.id,
        "loggedInUserId": parseInt(this.createdById)
      }
      this.mediaFileUploadService.deleteMediaFile(data).subscribe((res: any) => {
        let resSTR = JSON.stringify(res);
        let resJSON = JSON.parse(resSTR);
        if (resJSON?.success == true) {
          this.isShowPopup = false;
          this.isGenerating = false
          this.basicSchoolPayloads = {
            pageNo: 0,
            sortOrder: 'asc',
            search: '',
          };
          this.getMedia('page', this.basicSchoolPayloads)

        }
        else {
          this.isShowPopup = false;
          this.isGenerating = false;
          this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess')
        }
      }, (error) => {
        this.isGenerating = false
        this.toast.showMessage('Something went wrong!', '', 'unsuccess')
      })
    } else {
      this.isShowPopup = false
    }

  }

  applyFilter(event: any) {
    let filterValue = event?.target?.value;
    if (event?.target?.value.length > 0) {
      let roleFilters = this.mediaFileData?.filter((x: any) => {
        return (
          (
            (x?.fileName
              ?.toLocaleLowerCase()
              .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1) ||
            (x?.user?.name.toString()
              ?.toLocaleLowerCase()
              .indexOf(filterValue?.trim().toLocaleLowerCase()) > -1))
        );
      });
      this.dataSource = new MatTableDataSource<any>(roleFilters);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    } else {
      this.dataSource = new MatTableDataSource<any>(this.mediaFileData);
      this.dataSource.paginator = this.viewtable;
      this.dataSource.sort = this.sort;
      this.sortData();
    }
  }

}
