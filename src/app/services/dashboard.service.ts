import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private httpClient : HttpClient,
    private urlService : UrlService
    ) { }

  getDashboardData(payLoads: any) {
    let payLoadItem = {
      isThird: payLoads?.isThird,
      loginId: payLoads?.loginId,
      yearcode: payLoads?.yearcode
    }
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/dashboardCount`, payLoads)
  }

  getDashboardUserList(payLoads: any) {
    let payLoadItem = {
      isThird: payLoads?.isThird,
      loginId: payLoads?.loginId,
      yearcode: payLoads?.yearcode
    }
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/dashboardUserList`, payLoads)
  }
  
  publishToWebsite(payLoads: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/moveWebsiteData`, payLoads)
  }

}
