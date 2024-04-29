import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EncryptDecryptService } from 'src/app/services/encrypt-decrypt.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  constructor(private router: Router, private EncDecService: EncryptDecryptService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // encrypted data coming from backend - remove later
          // let encBody = JSON.stringify(event.body)
          // encBody = this.EncDecService.Encrypt(encBody)
          // event = event.clone({
          //   body: encBody
          // });

          // decrytion on frontend side
          if (!event?.url?.includes('assets') ) {
            let encBody = !!event?.body?.data
              ? this.EncDecService.Decrypt(event?.body?.data)
              : '';
            if (encBody && encBody != '') {
              encBody = JSON.parse(encBody);
              event = event.clone({
                body: encBody,
              });
            }
          }
        }


        return event;
      })
    );
  }
}
