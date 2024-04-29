import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appUsername]'
})
export class UsernameDirective {

  @Input('appUsername') appUsernameSearch: string = '';
  constructor(private _el: ElementRef) { }
  regxVal = /^[a-zA-Z0-9_-]*$/;
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this._el.nativeElement.value;
    let next: string = current.concat(event.key);

    if (next && !String(next).match(this.regxVal)) {
      event.preventDefault();
    }

    // this._el.nativeElement.value =
    // 	this._el.nativeElement.value.charAt(0).toUpperCase() + this._el.nativeElement.value.slice(1);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.appUsernameSearch == '') {
      if (control?.value?.trim()?.length === 0) {
        return { required: true };
      }
      if (control?.value?.length != null) {
        if (/\s/.test(control?.value[0])) {
          return { startwithSpaceError: true };
        }
      }
      const isValid = this.regxVal.test(control?.value);
      return !isValid ? { invalidInput: true } : null;
    } else if (this.appUsernameSearch == 'NR' && control?.value?.length > 0) {
      const isValid = this.regxVal.test(control?.value);
      return !isValid ? { invalidInput: true } : null;
    }
    return null;
  }

}
