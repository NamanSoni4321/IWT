import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { customer } from 'src/app/admin/interface/customer.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatStepper } from '@angular/material/stepper';
import { otp, roles } from 'src/app/admin/enums/roles.enum';
import { restrictEmail } from '../../restrict';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  @ViewChild('stepper') stepper: MatStepper;

  constructor(public dialogRef: MatDialogRef<AddComponent>,
    private dataService: AuthService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) { }

  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public customerForm: FormGroup;
  public isLinear: boolean = true;
  public customerId: number;

  buildForm() {
    this.firstFormGroup = this._formBuilder.group({
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[6-9][0-9]+$')]],
      role: [roles.USER]
    });

    this.secondFormGroup = this._formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]+$')]]
    });

    this.customerForm = this._formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
      email: ['', [Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z]+\\.[a-z]{2,7}'), restrictEmail(/yopmail\.[a-z]{2,7}$/i)]],
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  onSubmit(): void {
    this.ngxloader.start();
    const item: customer = {
      id: this.customerId,
      name: this.customerForm.value.name.trim(),
      email: this.customerForm.value.email.trim(),
    }
    this.dataService.addCustomer(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Customer Created Successfully');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error && error.error) {
          this.toastr.error('Please enter new email address','Email already exists')
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      }
    );
    this.dialogRef.close(item);
  }

  registeredNumber(): void {
    this.ngxloader.start();
    const item = this.firstFormGroup.value
    this.dataService.numberUpdate(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('OTP send successfully');
        this.stepper.next();
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error.error.error);
        if (error.error.error) {
          this.toastr.error('Please try another number', 'Mobile number already registered')
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      })
  };

  registeredOTP(): void {
    this.ngxloader.start();
    const item = this.secondFormGroup.value;
    this.dataService.numberUpdate(item).subscribe(
      (response) => {
        if (item.otp === otp.OTP) {
          this.ngxloader.stop();
          this.toastr.success('OTP verified successfully')
          this.customerId = response.id
          this.stepper.next();
        }
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error postting data:', error);
        if (error && error.error) {
          this.toastr.error('Pease try again', 'Invalid OTP')
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      });
  }

}
