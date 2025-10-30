import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

export function emailValidator(control: UntypedFormControl): {[key: string]: any} {
    var emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,8}$/;    
    if (control.value && !emailRegexp.test(control.value)) {
        return {invalidEmail: true};
    }
}

export function fieldMatcher(firstField: string, secondField: string) {
    return (group: UntypedFormGroup) => {
        let field = group.controls[firstField];
        let confirmField = group.controls[secondField];
        if (field.value !== confirmField.value) {
            return confirmField.setErrors({mismatchedPasswords: true})
        }
    }
}