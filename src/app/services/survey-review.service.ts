import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyReviewService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) { }

  viewSuveyReview(data: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveyDataListReviewDetails`, data)
  }

  reviewList(data: any, payloads: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/surveyDataListReview?pageNo=${payloads.pageNo}&pageSize=${payloads.pageSize ? payloads.pageSize : 10}&sortDir=desc&sortBy=${payloads.search ? `&searchKey=${payloads.search}` : ''}`, data)
  }

  submitReviewSurvey(payload: any) {
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/updSurveyReviewApprove`, payload)
  }

}
