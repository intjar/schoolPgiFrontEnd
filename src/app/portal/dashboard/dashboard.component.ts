import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast';
import { Location } from '@angular/common';
import * as Highcharts from 'highcharts';
import { DashboardService } from 'src/app/services/dashboard.service';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { Common } from 'src/app/commons/common';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  data:any = {};
  options: any = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '{point.name} {point.y}',
          style: {
            fontFamily: 'Montserrat',
            fontSize: '1.25em',
            color: '#363B46',
            fontWeight: '600'
          }
        },
        showInLegend: true,
      },
    },
    title: {
      text: ''
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    // series: [
    //   {
    //     type: 'pie',
    //     name: '',
    //     data: [
    //       {
    //         y:20,
    //         name:'Reviewed',
    //         color: '#ffa500'
    //       },
    //       {
    //         y:30,
    //         name:'Approved',
    //         color: '#3eb546'
    //       },
    //       {
    //         y:50,
    //         name:'Data Entry',
    //         color: '#e23333'
    //       },
          
    //     ],
    //   },
    // ],
  };
  userList:any = [];
  getSession: any = JSON.parse(sessionStorage.getItem('userDetails') || '');
  isLoading:boolean = false;
  displayedColumns = ['sn', 'levelName', 'admin', 'deo'];
  dataSource = new MatTableDataSource<any>();
  isSubmitted:boolean = false;
  yearCode: any;
  financialYearArr:any
  year: string = Common.setFinanacialYear();
  constructor(private toast: ToastService,
    private _location: Location,
    private dashboardService:DashboardService,
    private router:Router,
    private dataservice: DataService
  ) { 

    }
    ngOnInit() {
      this.toast.dismissSnackBar();
      this.viewFinancialYear();
      this.getDashboardata();
      //this.getUserDashboardata();
    }

  backToLevel() {
    this._location.back();
  }

  getDashboardata() {
    this.dataSource = new MatTableDataSource<any>([])
    this.data = [];
    this.userList = [];
    this.toast.dismissSnackBar()
    let params = {
      id: this.getSession?.uid,
      yearcode: null,
    }
    this.isLoading = true;
		const getDashboardData = this.dashboardService.getDashboardData(params);
    const getDashboardUserList = this.dashboardService.getDashboardUserList(params);
    let forkJoinArray :any = [
      getDashboardData,
      getDashboardUserList,
    ];
    forkJoin(forkJoinArray).subscribe(
			(res: any) => {
        this.isLoading = false;
				const [resDashboardData, resDashboardUserData] = res;
        if (resDashboardData?.result) {
          this.data = resDashboardData?.result;
          this.data.chartData = {
						...this.options,
						series: [
							{
								type: 'pie',
								name: '',
								data: [
                  {
                    y:this.data?.completedReview,
                    name:'Reviewed',
                    color: '#ffa500'
                  },
                  {
                    y:this.data?.completedApprove,
                    name:'Approved',
                    color: '#3eb546'
                  },
                  {
                    y:this.data?.completedDataEntry,
                    name:'Data Entry',
                    color: '#e23333'
                  }, 
                ],
							},
						],
					}
        } else {
          this.data = [];
          console.log('res?.errorMessage', res);
          this.toast.showMessage(res[0]?.errorMessage, '', 'unsuccess');
        }
        
        if (resDashboardUserData?.result) {
          resDashboardUserData?.result.row?.map((rowData:any, index:number) => {
            let userData = {
              'sn': ++index,
              'levelName': rowData[0],
              'admin': rowData[1],
              'deo': rowData[2]
            };
            this.userList.push(userData);
          })
          this.dataSource = new MatTableDataSource<any>(this.userList);
        } else {
          this.dataSource = new MatTableDataSource<any>([])
          this.isLoading = false;
          console.log('res?.errorMessage', res?.errorMessage);
          this.toast.showMessage(res?.errorMessage, '', 'unsuccess');
        }
      },
			(error) => {
        this.data = [];
        this.dataSource = new MatTableDataSource<any>([])
				this.isLoading = false;
				this.toast.showMessage('Something went wrong', '', 'unsuccess');
		});
  }

  getSurveyStatusList(status:any){
    if(status == "users_list"){
      this.router.navigate(['/portal/manage-user/instanceuser']);
    }else{
      this.router.navigate(['./portal/report/survey-status-list-report',status]);
    }
    // if(this.getSession?.roleId ==1){
    //   if(status == "users_list"){
    //     this.router.navigate(['/portal/manage-user/instanceuser']);
    //   }else{
    //     this.router.navigate(['./portal/report/survey-status-list-report',status]);
    //   }
    // }else{
    //   return;
    // }
  }

  publishToWebsite(){
    let data:any = {
      year_code:+this.yearCode?.yearId
    }
    this.isSubmitted = true;
    this.dashboardService.publishToWebsite(data).subscribe((res:any) => {
      this.isSubmitted = false;
      if (res.success == true) {
        console.log('res?.errorMessage', res?.errorMessage);
        this.toast.showMessage(res?.message, '', 'success');
      }
      else {
        this.isSubmitted = false;
        console.log('res?.errorMessage', res?.errorMessage);
        this.toast.showMessage(res?.errorMessage, '', 'unsuccess');

      }
    }, (error) => {
      this.isSubmitted = false
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

  selectFinancialYear(selectedItem: any) {
    this.yearCode = selectedItem;
  }

  viewFinancialYear() {
    this.financialYearArr = [];
    this.dataservice.viewYear().subscribe((res: any) => {
      if (res?.success) {
        this.financialYearArr = res?.result;
        this.yearCode = this.financialYearArr[0]
      } else {
        console.log('res?.errorMessage', res?.errorMessage);
        this.toast.showMessage(res?.message, '', 'unsuccess');
      }
    }, (error) => {
      this.toast.showMessage('Something went wrong', '', 'unsuccess');
    })
  }

}
