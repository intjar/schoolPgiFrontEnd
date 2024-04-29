import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
	selector: '[appDomain]',
	providers: [{ provide: NG_VALIDATORS, useExisting: DomainDirective, multi: true }],
})
export class DomainDirective {
	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('appDomain') asDomainWithHttp: string = '';
	constructor() { }
	// regxWithoutHttp = new RegExp(/^(?!-.)(([a-z0-9-]+(\.[a-z0-9-]+)+([a-z])(:\d{2,5})?)|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})))$/);
	// regxWithHttp = new RegExp(/^(((ht|f)tps?):\/\/)?(([a-z0-9-]+(\.[a-z0-9-]+)+([a-z])(:\d{2,5})?)|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})))$/);

	regxWithoutHttp = new RegExp(
		/^(?!-.)(([a-z0-9-]+(\.[a-z0-9-]+)+([a-z])(:\d{2,5})?)|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})))$/
	);
	// regxWithHttp = new RegExp(
	// 	/^(((ht|f)tps?):\/\/)?(([a-z0-9-]+(\.[a-z0-9-]+)+([a-z])(:\d{2,5})?)|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})))$/
	// );

	regxWithHttp = new RegExp("^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$");
	

	validate(control: AbstractControl): ValidationErrors | null {
		if (this.asDomainWithHttp == '') {
			if (control?.value?.length === 0) {
				return { required: true };
			}
			if (control?.value?.length != null) {
				if (/\s/.test(control?.value[0])) {
					return { startwithSpaceError: true };
				} else if (control?.value?.substring(0, control?.value.indexOf('.')).length < 2) {
					return { invalidInput: true };
				} else if (!control?.value?.includes(':')){
						if (control?.value?.slice(control?.value?.lastIndexOf('.')).length>7){
							return { invalidInput: true };
						}
				} else if (control?.value?.includes(':')){
					if ((control?.value?.indexOf(':') - control?.value?.lastIndexOf('.'))>7){
						return { invalidInput: true };
					}
					if (+(control?.value?.slice(control?.value?.lastIndexOf(':')+1)) > 65535){
						return { invalidInput: true };
					}
				}
			}

			const isValid = this.regxWithoutHttp.test(control.value);
			return !isValid ? { invalidInput: true } : null;
		}
		// if (control?.value?.trim().length === 0) {
		// 	return { required: true };
		// }
		//WOHP -> With Out Http, WHP-> With Http
		if (this.asDomainWithHttp === 'WHP') {
			if (!control?.value) {
				return null;
			}
			const isValid = this.regxWithHttp.test(control?.value);
			return !isValid ? { invalidPattern: true } : null;
		} else {
			if (!control?.value) {
				return null;
			}
			const isValid = this.regxWithoutHttp.test(control?.value);
			return !isValid ? { invalidPattern: true } : null;
		}
	}
}
