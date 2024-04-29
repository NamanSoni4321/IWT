import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { login } from 'src/app/admin/interface/login.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ForgotPasswordComponent } from 'src/app/login/forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public form!: FormGroup;
  public hide = true;
  private formSubmitAttempt!: boolean;

  constructor(private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private ngxloader:NgxUiLoaderService,
    private dialog:MatDialog) { }

  ngOnInit() {
     if (localStorage.getItem('token') != null) {
      this.router.navigate(['/dashboard']);
      return true;
    }
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(field: string) {
    return (
      (!this.form.get(field)?.valid && this.form.get(field)?.touched) ||
      (this.form.get(field)?.untouched && this.formSubmitAttempt)
    );
  }

  forgotPassword(){
      this.dialog.open(ForgotPasswordComponent);
  }

  /*login*/
  onLogin(): void {
    if (this.form.valid) {
      this.ngxloader.start();
      this.loginAttempt().subscribe(
        (res) => {
          if (res.role === 'ADMIN') {
            this.ngxloader.stop();
            this.router.navigate(['/dashboard']);
            this.toastr.success('Hello Admin', 'Login successful');
          } else {
            this.toastr.error('You are not admin!', 'Login Failed');
          }
        },
        (error) => {
          this.ngxloader.stop();
          console.error('Error during login:', error);
          if (error && error.error) {
            this.toastr.error('Please enter a valid login credential','Invalid login credential')
          } else {
            this.toastr.error('An error occurred while fetching data.', 'Error');
          }
        }
      );
    }
    this.formSubmitAttempt = true;
  }

  /*Admin login attempt*/
  private loginAttempt(): Observable<login> {
    const user = this.form.value;
    return this.authService.login(user).pipe(
      map((res) => {
        return res
      })
    );
  }
}
