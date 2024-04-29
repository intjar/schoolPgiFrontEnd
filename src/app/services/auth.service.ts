import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UrlService } from './url.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private dataSevice: DataService, private urlService: UrlService) { }

  refreshTokenTimeout: any;
  accessToken: any;
  private jwtHelper: JwtHelperService = new JwtHelperService();

  startRefreshTokenTimer() {
    // set a timeout to refresh the token a minute before it expires
    let loginaccessT: any = JSON.parse(sessionStorage.getItem('userDetails') as string);
    this.accessToken = this.jwtHelper.decodeToken(loginaccessT?.accessToken)

    const expires = new Date(this.accessToken?.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;   

     this.refreshTokenTimeout = setTimeout(() => this.refreshToken(loginaccessT?.refreshToken).subscribe(),
      timeout
    );
   
  }

  stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  refreshToken(refreshToken): Observable<any> {
    return this.http.post(`${this.urlService.API_ENDPOINT}/refreshtoken`, { refreshToken }).pipe(map((res: any) => {   
     if (res?.success) {
       sessionStorage.setItem('userDetails', JSON.stringify(res));
       this.startRefreshTokenTimer();
      } else{       
        this.dataSevice.logout()
      }
    })
    );
  }

}


