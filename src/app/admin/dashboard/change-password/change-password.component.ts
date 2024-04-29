import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/Auth/auth.service';
import { roles } from '../../enums/roles.enum';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public changePassword!: FormGroup;
  public hide = true;
  private formSubmitAttempt!: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.changePassword = this.fb.group({
      oldpassword: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
}, { validators: this.passwordMatchValidator });
  };

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('confirmPassword').value;
  
    if (password === confirmPassword) {
      return null;
    } else {
      group.get('confirmPassword').setErrors({ passwordsNotMatch: true });
      return { passwordsNotMatch: true };
    }
  }

  onSubmit() :void{
    if (this.changePassword.controls['password'].value !== this.changePassword.controls['confirmPassword'].value) {
      this.toastr.error("Password not match")
    } else if (this.changePassword.controls['password'].value === null ||
      this.changePassword.controls['password'].value === "" || this.changePassword.controls['oldpassword'].value === "") {
      this.toastr.error("Please enter a valid password")
    }
    else if (this.changePassword.valid) {
      this.ngxloader.start();
      const form = this.changePassword.value;
      const data = {
        id: roles.ADMIN,
        oldPassword: form.oldpassword,
        newPassword: form.password
      }
      this.authService.changePassword(data).subscribe((response) => {
        this.ngxloader.stop();
        this.toastr.success("Change Password Successfully");
        this.dialog.closeAll();
      }, (error) => {
        this.ngxloader.stop();
        console.error('Error', error);
        if (error.error) {
          this.toastr.error("Please enter a correct old password", "Incorrect old password")
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error')
        }
      });
    }
  }
}
