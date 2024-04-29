import { Injectable, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class MasterSettingService {

  constructor(private httpClient: HttpClient, private urlService: UrlService) { }


  viewSchool(payloads:any, request:any){
    return this.httpClient.post(`${this.urlService.API_ENDPOINT}/viewSchool?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=created_at${payloads.search ? `&searchKey=${payloads.search}`: ''}`, request)
   }


   viewQuestions(payloads:any, request:any)
   {
      return this.httpClient.post(`${this.urlService.API_ENDPOINT}/viewQuestions?pageNo=${payloads.pageNo}&pageSize=${payloads.size ? payloads.size : 10}&sortDir=${payloads.sortOrder}&sortBy=created_at${payloads.search ? `&searchKey=${payloads.search}`: ''}`, request);
   }



}
