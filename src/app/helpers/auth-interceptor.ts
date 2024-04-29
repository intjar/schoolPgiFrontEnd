import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { Router } from '@angular/router';
  import * as CryptoJS from 'crypto-js';
  import { JwtHelperService } from '@auth0/angular-jwt';

  import { EncryptDecryptService } from 'src/app/services/encrypt-decrypt.service';
  @Injectable()
  export class AuthInterceptor implements HttpInterceptor {
    constructor(private EncDecService: EncryptDecryptService  ) { }

    sigKey: string = 'QD32VdbRuMa0iI0q9q7cH6FIHGcNWGdEZOLyK669';
    private jwtHelper: JwtHelperService = new JwtHelperService();
    isTokenExpired() {
      let loginaccessT: any = JSON.parse(
        // sessionStorage.getItem('token') as string
        sessionStorage.getItem('userDetails') as string
      );
      return this.jwtHelper.isTokenExpired(loginaccessT?.accessToken);
    }

    intercept(
      request: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<any>> {

      // debugger
      ////add authorization header with jwt token if available
      // const currentUser = JSON.parse(sessionStorage.getItem('token') as string);
      let loginaccessToken: any = JSON.parse(sessionStorage.getItem('userDetails') as string);      
      const currentUser =loginaccessToken?.accessToken
      // const currentUser = sessionStorage.getItem('token');
      let timeStampValue: number = new Date().getTime();
      var queryParam = request.url.split('?');
      var inParam = queryParam[1] ? queryParam[1] : 'null';
      var tokenReqd = false;
      //if (currentUser && currentUser.access_token != null &&  currentUser.access_token != '')
      if (currentUser && currentUser != null &&  currentUser != '') // !this.isTokenExpired()
       {       
        // request?.url?.includes('auth/refresh')
        if (request?.url?.includes('refreshtoken')) {
          tokenReqd = false;
        } else {
          tokenReqd = true;
        }
      } else {
        tokenReqd = false;
      }     
      if (tokenReqd) {
        if(request?.url?.includes('mediaUpload') || request?.url?.includes('uploadsurveyexcel') )
        {
          request = request.clone({
            // body: (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
            setHeaders: {
              'Accept-Language': 'en',
              Authorization: `Bearer ${currentUser}`,
              // Authorization: `Bearer ${currentUser.access_token}`,
              signature: this.getSignature(
                request.url,
                timeStampValue.toString(),
                (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
                inParam
              ),
              timestamp: timeStampValue.toString()
            },
          });
        }
        else
        {       
          request = request.clone({
            body: (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
            setHeaders: {
              'Accept-Language': 'en',
              Authorization: `Bearer ${currentUser}`,
              // Authorization: `Bearer ${currentUser.access_token}`,
              signature: this.getSignature(
                request.url,
                timeStampValue.toString(),
                (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
                inParam
              ),
              timestamp: timeStampValue.toString()
            },
          });
        }

      } else {
        request = request.clone({
          body: (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
          setHeaders: {
            'Accept-Language': 'en',
            signature: this.getSignature(
              request.url,
              timeStampValue.toString(),
              (request?.url?.includes('bulk-upload/excel') ? request.body : (request.body == null ? null : { data: this.EncDecService.Encrypt(JSON.stringify(request.body)) })),
              inParam
            ),
            timestamp: timeStampValue.toString()
          },
        });
      }
      return next.handle(request);
    }
    private getSignature(
      inUrl: string,
      timestamp: string,
      inData: string,
      inParam?: string,
      inRecordId?: any
    ): string {
      let Data: any;
      let secretKey: string = this.sigKey;
      inParam = inParam === undefined || inParam === null ? 'null' : inParam;
      inParam = inParam.replace(/"/g, '%22');
      inParam = inParam.replace(/'/g, '%27');
      inParam = inParam.replace(/ /g, '%20');
      // inParam = encodeURI(inParam);
      let _details = inParam + timestamp;
      _details = _details + this.getHashCode(_details);

      if (inRecordId !== undefined && inRecordId !== null && inRecordId > 0) {
        _details = _details + inRecordId;
      }
      if (inUrl !== undefined && inUrl !== null && inUrl !== '') {
        _details =
          _details +
          (JSON.stringify(inData) === '{}' ? 'null' : JSON.stringify(inData));
        let _urlArr = inUrl.split('/');

        Data =
          _urlArr[4] +
          timestamp +
          (_urlArr[5] === undefined || _urlArr[5] === null
            ? 'null'
            : _urlArr[5]) +
          (_urlArr[6] === undefined || _urlArr[6] === null
            ? 'null'
            : _urlArr[6]) +
          _details;
      }
      let hash1 = CryptoJS.HmacSHA256(Data, this.sigKey);
      let hashInBase64 = CryptoJS.enc.Base64.stringify(hash1);
      return hashInBase64;
    }

    private getHashCode(data: any) {
      let hash = 0;
      let char;
      if (data.length == 0) return 0;
      for (let i = 0; i < data.length; i++) {
        char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash;
    }
  }
