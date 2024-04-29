import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlService } from './url.service';
@Injectable({
  providedIn: 'root'
})
export class SurveyDataUploadService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) { }



  downloadSurveyExcel(payloads:any){
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/downloadsurveyexcel`, payloads)
   }

  downloadExcel(payloads:any){
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/downloadExcel`, payloads)
   }


   uploadExcel(payLoads:any){

    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/uploadsurveyexcel?surveyId=${payLoads.surveyId}&loginUserid=${payLoads.loggedInUserId}`,'')

   }

}
