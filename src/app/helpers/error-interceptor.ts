import { Injectable, TemplateRef } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EncryptDecryptService } from '../services/encrypt-decrypt.service';
import { ToastService } from '../services/toast';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router, private encrypt_decrypt: EncryptDecryptService, private toast: ToastService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        // console.log(err)
        // if (err.error?.errors[0]?.extensions?.code == "TOKEN_EXPIRED") {
        //   this.router.navigate(['login']).then(() => console.log('You have been logged out.', '', "errorMessages"));
        //  // this.router.navigateByUrl('auth/login').then(() => console.log('You have been logged out.', '', "errorMessages"));
        // }
        if (err.status === 403) { 
          let errorMSg : any = [] 
          errorMSg =  this.encrypt_decrypt.Decrypt(err?.error?.data) 
          let resJSON = JSON.parse(errorMSg);         
         this.toast.showMessage(resJSON?.errorMessage, '', 'unsuccess');
          this.router.navigateByUrl('login');                    
        } 
        return throwError(err);
      })
    );
  }
}
