import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[urlPattern]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UrlPatternDirective, multi: true }],
})
export class UrlPatternDirective implements Validator {
  @Input('urlPattern') urlPattern: string = '';
  constructor(private _el: ElementRef) {}
	regxVal = /^[-/_{}#0-9a-zA-Z]*$/;
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
		if (control.value.length === 0) {
			return { required: true };
		}
		else if (
			!(control.value.charCodeAt(0) > 47 && control.value.charCodeAt(0) < 58) && // numeric (0-9)
      !(control.value.charCodeAt(0) > 64 && control.value.charCodeAt(0) < 91) && // upper alpha (A-Z)
      !(control.value.charCodeAt(0) > 96 && control.value.charCodeAt(0) < 123) && // lower alpha (a-z)
			!(control.value[0] == '{' )
		) {
			return { invalidInput: true };
		}
		if (control.value?.length > 0){
			if (
        control.value[control.value.length - 1] == '/' ||
        control.value[control.value.length - 1] == '-' ||
				control.value[control.value.length - 1] == '_' ||
				control.value[control.value.length - 1] == '#' ||
				control.value[control.value.length - 1] == '{'
      ) {
				return { invalidPattern: true };
      }
			else if (
        control.value.indexOf('//') != -1 ||
        control.value.indexOf('--') != -1 ||
        control.value.indexOf('__') != -1 ||
        control.value.indexOf('##') != -1 ||
        control.value.indexOf('}}') != -1 ||
        control.value.indexOf('{{') != -1 ||
        control.value.indexOf('{/}') != -1 ||
        control.value.indexOf('{}') != -1
      ) {
				return { invalidInput: true };
      }
			else if (
        control.value.indexOf('{') != -1 || control.value.indexOf('}') !=-1
      ) {
				for (let index = 0; index < control.value.length; index++) {
					if (control.value[index] == '{'){
						if ((index !=0 && control.value[index - 1] != '/') ||
						control.value[index + 1] == '/'){
							return { invalidPattern: true };
						}
					}
				}
				for (let index = 1; index < control.value.length; index++) {
					if (control.value[index] == '}'){
						if (control.value[index - 1] == '/' ||
						(index != (control.value.length - 1) && control.value[index + 1] != '/')){
							return { invalidPattern: true };
						}
					}
				}
      }
		}
		const isValid = this.regxVal.test(control.value);
		return !isValid ? { invalidPattern: true } : null;
  }
}
