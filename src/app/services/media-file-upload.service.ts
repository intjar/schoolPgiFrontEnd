import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class MediaFileUploadService {

  constructor(private httpClient : HttpClient , private urlService : UrlService) { }

deleteMediaFile(data:any){
  return this.httpClient.post(`${this.urlService.API_ENDPOINT}/deleteFile`,data) 
}

}
