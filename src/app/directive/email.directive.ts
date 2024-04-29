import { Directive, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';


@Directive({
  selector: '[appEmail]',
  providers: [{ provide: NG_VALIDATORS, useExisting: EmailDirective, multi: true }],
})
export class EmailDirective {
  constructor(private _el: ElementRef) {}
  regxVal = /^[a-zA-Z@.0-9_-]*$/;
  private regex: RegExp = new RegExp(this.regxVal);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this._el.nativeElement.value;
    let next: string = current.concat(event.key);

    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    const isValid = regex.test(control.value);
    return !isValid ? { invalidInput: true } : null;
  }

}
