import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxPrintElementService } from 'ngx-print-element';
import { Common } from 'src/app/commons/common';
import { ExcelService } from 'src/app/services/excel.service';
import { SurveyDataEntryService } from 'src/app/services/survey-data-entry.service';
import { SurveyReviewService } from 'src/app/services/survey-review.service';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-survey-review',
  templateUrl: './survey-review.component.html',
  styleUrls: ['./survey-review.component.scss']
})
export class SurveyReviewComponent {
  isShowFillSurvey: boolean = false;
  createdById: any;
  displayedColumns = [
    'sn',
    'Survey Name',
    'Finacial Year',
    'Total Questions',
    'Attempted Questions',
    'Instance Name',
    'Instance Level',
    'Active Upto',
    'status',
    'action'
  ];
  dataSource: any = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) viewtable: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isLoading: boolean = false;
  surveyId: any;
  reviewData: any;
  isVisible: boolean = false;
  timer: number = Common.timeout;
  msg: string;
  dataUniqueArray: any = []
  reviewPayload: any;
  totalCount: number = 0;
  pageNumber: number = 0;
  searchValue: string = '';
  isGenerating: boolean = false;
  reviewSurvey: any;
  printDataSource: any[] = [];
  printPage: any = Common;
  pdfOpen: boolean = false;
  public config = Common.config;
  isSubmitted: boolean = false;
  statusJson: any = Common.dataSurveyStatus;
  breadcrums = {
    heading: 'Master Setting',
    links: [
      { link: 'Dashboard', routing: '/dashboard/dashboard' },
      { link: 'Manage Survey' },
      { link: 'Survey Review', current: true },
    ],
  };
  dataSourceForm: any = FormGroup;
  remarks: any
  isApproved: boolean = false
  isRequest: boolean = false
  deoIdNumber: any;
  status: any
  isApprovedType: any = window.location.href.includes('/survey/survey-approve')
  domainObjectArray: any;
  yearCode: any = 'All';
  isDataLoading: boolean = true;
  remarkArr: any = [];
  displayStyle = "none";
  remarksModal:boolean = false;
  domainSubDomain:any;
  instance_name:string = "";
  
  constructor(
    private surveyReviewService: SurveyReviewService,
    private _ExcelService: ExcelService,
    public print: NgxPrintElementService,
    private formBuillder: FormBuilder,
    private surveyDataEntryService: SurveyDataEntryService,
    private toast: ToastService) {
    this.createdById = (sessionStorage.getItem("userId"))
  }

  ngOnInit() {
    this.reviewPayload = {
      pageNo: 0,
      sortOrder: 'asc',
      search: '',

    }

    this.surveyReviewList('page', this.reviewPayload)

    this.dataSourceForm = this.formBuillder.group({
      remarks: new FormControl('', [Validators.required]),

    })
  }

  GetFinancialYear(data) {
    this.yearCode = data == 'All' ? 'ALL' : data;
    this.reviewPayload = {
      pageNo: 0,
      sortOrder: 'asc',
      search: '',
    }
    this.surveyReviewList('page', this.reviewPayload)


  }

  fillSurvey(id: any) { 
    // console.log('iddddd with data', id) 
    this.surveyId = id?.survey_id
    this.deoIdNumber = id?.deo_created_by
    this.status = id?.status
    this.instance_name = id?.instance_name;
    this.isShowFillSurvey = true;
    this.viewSurveyReview();
  }

  viewSurveyReview() {
    this.isLoading = true
    let data = {
      "surveyId": this.surveyId,
      "loginId": this.deoIdNumber
    }
    this.surveyReviewService.viewSuveyReview(data).subscribe((res: any) => {
      // console.log('res',res)
      if (res?.success) {
        let allItemsId: any = [];
        if (res?.result.length > 0) {

          this.dataSourceForm.patchValue({
            remarks: res?.result?.[0]?.remarks
          });
        }

        //Filtered Subdomain
        res?.result.forEach((domSub: any) => {
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


        // let uniqueQuestionDomainid = [
        //   ...new Set(
        //     res?.result.map(
        //       (item) => { return { 'domain': item.domain_id, 'subDomain': item.sub_domain_id } }
        //     )
        //   ),
        // ];
        
        console.log('domainSubDomain', this.domainSubDomain)
        // const arrayUniqueByKey = [...new Map(this.domainSubDomain.map((item: any) => 
        //   [item['subDomain'], item])).values()];

        // console.log('arrayUniqueByKey',arrayUniqueByKey);
        this.domainObjectArray = this.domainSubDomain
        this.dataUniqueArray = [
          ...new Set(
            res?.result.map(
              (item) => item.domain_id || item.sub_domain_id
            )
          ),
        ];

        this.reviewData = res?.result;
        // console.log('this.reviewData', this.reviewData)
        this.isLoading = false
      } else {
        this.reviewData = []
        this.isLoading = false
        this.showAlert(res?.errorMessage, 'unsuccess')
      }
    }, (error) => {
      this.isLoading = false
      this.showAlert('Something went wrong!', 'unsuccess')
    })
  }


  surveyReviewList(type: string, payloads: any) {
    this.isLoading = true;
    let data = {
      "loginId": parseInt(this.createdById),
      "inpPg": window.location.href.includes('/survey/survey-approve') ? 'AP' : "RV",
      yearcode: (this.yearCode || this.yearCode == 'ALL') ? this.yearCode : Common.setFinanacialYear()
    }
    type == 'page'
      ? ((this.dataSource = new MatTableDataSource<any>()),
        (this.isLoading = true))
      : '';

    this.printDataSource = [];
    this.surveyReviewService.reviewList(data, payloads).subscribe((res: any) => {
      if (res?.success) {
        let dataSource = res?.result;
        this.reviewSurvey = dataSource;
        this.printDataSource = structuredClone(dataSource);
        if (type == 'page') {
          (this.dataSource = new MatTableDataSource<any>(dataSource)),
            (this.isLoading = false);
          (this.totalCount = dataSource?.[0]?.tot_count);
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
            'S.No',
            'Survey Name',
            'Financial Year',
            'Total Questions',
            'Attempted Questions',
            'Instance Name',
            'Instance Level',
            'Status',
            'Active Upto'
          ];
          let itemData = structuredClone(this.printDataSource);

          itemData.forEach((element: any) => {
            element['S.No'] = element?.sno
            element['Survey Name'] = element?.survey_name
            element['Financial Year'] = element?.yr_code
            element['Total Questions'] = element?.total_question
            element['Attempted Questions'] = element?.attempted_question
            element['Instance Name'] = element?.instance_name
            element['Instance Level'] = element?.level_name
            element['Status'] = element?.status
            element['Active Upto'] = element?.active_upto
          });
          setTimeout(() => {
            this._ExcelService.downloadFile(
              itemData,
              'Review_Survey',
              headers
            );
            this.isGenerating = false
          }, 500);
        }
      }
      else {
        this.showAlert(res.errorMessage, 'unsuccess')
        this.isLoading = false;
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.showAlert('Something went wrong!', 'unsuccess')
    })
  }

  showAlert(data: string, type: string) {
    this.toast.showMessage(data, '', type);
    // if (this.isVisible) {
    //   return;
    // }
    // this.isVisible = true;
    // this.msg = data
    // setTimeout(() => this.isVisible = false, this.timer)
  }

  handlePageEvent(event: any) {
    this.pageNumber = event?.pageIndex
    let payLoads = {
      pageNo: this.pageNumber,
      sortOrder: 'asc',
      search: '',
    };
    this.surveyReviewList('page', payLoads)
  }

  filterData(type: string) {
    this.pageNumber = 0;
    let payloads = {
      pageNo: 0,
      sortOrder: 'asc',
      search: type == 'clear' ? '' : this.searchValue.toLowerCase(),
    };
    type == 'clear' ? (this.searchValue = '') : '';

    this.surveyReviewList('page', payloads);
  }

  printData(type: string) {
    let payLoads = {
      pageNo: 0,
      // sortOrder: 'asc',
      search: this.searchValue.toLowerCase(),
      pageSize: this.totalCount,
    };
    this.surveyReviewList(type, payLoads);
  }

  submitReview(type: string) {
    type == 'RV' ? this.isApproved = true : this.isRequest = true


    let payLoads = [{
      login_id: parseInt(this.createdById),
      survey_id: this.surveyId,
      year_code: this.reviewData?.[0]?.year_assigned_on,
      survey_name: this.reviewData?.[0]?.survey_name,
      survey_description: this.reviewData?.[0]?.survey_desc,
      year_assigned_on: this.reviewData?.[0]?.year_assigned_on,
      active_upto: this.reviewData?.[0]?.valid_upto,
      deo_created_by: this.reviewData?.[0]?.deo_created_by,
      event_code: type,
      remarks: this.dataSourceForm.value.remarks
    }]

    this.surveyReviewService.submitReviewSurvey(payLoads).subscribe((res: any) => {
      if (res?.success) {
        this.showAlert('Updated Successfully!!', 'success')
        this.isApproved = false
        this.isRequest = false
        this.isShowFillSurvey = false;

        let payloads = {
          pageNo: 0,
          sortOrder: 'asc',
          search: '',
        }
        this.surveyReviewList('page', payloads)
      }
      else {
        this.showAlert(res.errorMessage, 'unsuccess')


        this.isApproved = false
        this.isRequest = false
      }


    }, (error) => {
      this.isLoading = false
      this.isApproved = false
      this.isRequest = false
      this.showAlert('Something went wrong!', 'unsuccess')
    })
  }

  backToReview() {
    this.reviewPayload = {
      pageNo: 0,
      yearCode: this.yearCode = 'all',
      sortOrder: 'asc',
      search: '',
    }
    this.surveyReviewList('page', this.reviewPayload)


  }

  viewRemark(item: any) {
    this.remarksModal = true;
    this.displayStyle = "block";
    this.isDataLoading = true;
    this.remarkArr = []
    let data = {
      "surveyId": item?.survey_id,
      "loginId": item?.deo_created_by,
    }
    this.surveyDataEntryService.getRemark(data).subscribe((res: any) => {
      if (res?.success) {
        this.remarkArr = res?.result
        this.isDataLoading = false;
      } else {
        this.isDataLoading = false;
      }
    }, (error) => {
      this.isLoading = false;
      this.displayStyle = "none";
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  closeRemarksPopup(){
    this.remarksModal = false;
    this.displayStyle = "none";
  }
}
