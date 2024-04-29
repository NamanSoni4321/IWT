import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/Auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

 public form!: FormGroup;
 public otpform!: FormGroup;
 public otp!:boolean;
 public hide = true;
  
  constructor(public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private fb: FormBuilder,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader:NgxUiLoaderService) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required,Validators.email]],
    });
    
    this.otpform = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]+$')]],
      password: ['', Validators.required]
    })
  }

  isFieldInvalid(field: string) {
    return (
      (!this.form.get(field)?.valid && this.form.get(field)?.touched) ||
      (this.form.get(field)?.untouched)
    );
  }

  forgotPassword(){
    if(this.form.invalid) return;
      this.ngxloader.start();
      const item = this.form.value
      this.dataService.forgotPassword(item).subscribe(
        (response) => {
          this.ngxloader.stop();
          this.toastr.success('OTP send successfully');
          this.otp = true;
        },
        (error) => {
          this.ngxloader.stop();
          console.error('Error posting data:', error);
          if(error) {
            this.toastr.error('Please enter a valid email','Invalid Email')
          } else {
            this.toastr.error('An error occurred while fetching data.', 'Error');
          }
        })
  }

  otpSubmit(){
    if(this.otpform.invalid) return;
    this.ngxloader.start();
    const item = this.otpform.value
    this.dataService.forgotPassword(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Password was successfully changed');
        this.otp = true;
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if(error) {
          this.toastr.error('Please enter a valid OTP','Invalid OTP')
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      })
    }
}

