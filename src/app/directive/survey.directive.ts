import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[surveyValidate]',
	providers: [{ provide: NG_VALIDATORS, useExisting: surveyDirective, multi: true }],
})
export class surveyDirective implements Validator {
	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('surveyValidate') surveyValidate: string = '';
	constructor(private _el: ElementRef) { }
	regxVal = /^[A-Za-z]+([a-zA-Z0-9 /\?!._-])*$/;
	sysConfigRegxVal = /^[-/_{}#0-9a-zA-Z ]*$/;
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
		if (this.surveyValidate == '') {
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
		} else if (this.surveyValidate == 'NR' && control?.value?.length > 0) {
			const isValid = this.regxVal.test(control?.value);
			return !isValid ? { invalidInput: true } : null;
		}
		return null;
	}
}
