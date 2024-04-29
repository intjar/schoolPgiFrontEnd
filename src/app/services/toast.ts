import { Injectable, TemplateRef } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Common } from 'src/app/commons/common';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];
  timer:number  = Common.timeout;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private _snackBar: MatSnackBar){

  }

  // Push new Toasts to array with content and options
  showAlert(textOrTpl: string | TemplateRef<any>, options: any = {}): void {
    // const obj = { textOrTpl, ...options };
    // this.toasts.push(obj);

    const messageExists = this.toasts.findIndex(
      (tst) => tst.textOrTpl === textOrTpl
    );
    if (messageExists >= 0) {
      return;
    }
    const obj = { textOrTpl, ...options };
    this.toasts.push(obj);

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t !== obj);
    }, options.delay);
  }

  // Callback method to remove Toast DOM element from view
  remove(toast: any): void {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  showMessage(message: string, action: string ,customClass:string){
    console.log(message, action)
    this._snackBar.open(message, action, 
      {"duration": this.timer, horizontalPosition: this.horizontalPosition,
       verticalPosition: this.verticalPosition,
       panelClass: [customClass]});
  }

  dismissSnackBar()
  {
    this._snackBar.dismiss();
  }
  
}