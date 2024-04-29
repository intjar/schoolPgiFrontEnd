import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlService } from './url.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SurveyDataEntryService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) { }

  // &sortBy=%27Survey%20Name%27'

  getDataList(payLoads: any) {
    let payLoadItem = {
      isThird: payLoads?.isThird,
      loginId: payLoads?.loginId,
      yearcode: payLoads?.yearcode
    }
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveyDeoList?pageNo=${payLoads?.pageNo ? payLoads?.pageNo : 0}&pageSize=${payLoads?.size ? payLoads?.size : 10}&sortDir=desc&sortBy=Survey_Id${payLoads?.search ? `&searchKey=${payLoads?.search}` : ''}`, payLoadItem)
  }

  getDataListById(payLoads: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveyDataEntryById`, payLoads)
  }


  inserDataList(payloads: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/insertSurveyDataEntry`, payloads)

  }
  uploadFiles(payloads: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/mediaUpload`, payloads)
  }
  getmediaCategory() {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/mediaCategory`, '')
  }

  deleteMedia(payload: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/deleteFile`, payload)
  }

  getRemark(payload: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/getRemarks`, payload)
  }

  getuploadsurveyexcel(payload: any, data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/uploadsurveyexcel?surveyId=${data.surveyId}&loginUserid=${data.loginUserid}&isUpload=${data.isUpload}`, payload,)
  }

  getQuestionSubquestion(payload) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/viewQuestionssubquestion`, payload)
  }


  
}
