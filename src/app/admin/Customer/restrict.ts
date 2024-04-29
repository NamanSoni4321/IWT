import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function restrictEmail(restrict: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email: string = control.value;
    const forbidden = restrict.test(email);

    return forbidden ? { restrict: { value: email } } : null;
  };
}
