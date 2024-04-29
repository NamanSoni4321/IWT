import { AbstractControl, ValidatorFn } from '@angular/forms';

export function atLeastOneFieldValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      control.get('material1').value ||
      control.get('material2').value ||
      control.get('material3').value
    ) {
      return null;
    }
    return { noFieldsFilled: true };
  };
}
