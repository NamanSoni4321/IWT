import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/Auth/auth.service';
import { customer } from 'src/app/admin/interface/customer.interface';
import { restrictEmail } from '../../restrict';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  customerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: customer,
    public dialogService: MatDialog,
    private _formBuilder: FormBuilder,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) {
  }

  ngOnInit(): void {
    this.customerForm = this._formBuilder.group({
      name: [this.data.name, [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
      email: [this.data.email, [Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z]+\\.[a-z]{2,7}'), restrictEmail(/yopmail\.[a-z]{2,7}$/i)]],
      address: [this.data.address]
    });
  }

  onSubmit(): void {
    this.ngxloader.start();
    const item: customer = {
      id: this.data.id,
      name: this.customerForm.value.name.trim(),
      email: this.customerForm.value.email.trim(),
      address: this.customerForm.value?.address?.trim()
    }

    this.dataService.customerUpdate(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Customer Updated Successfully');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error && error.error) {
          this.toastr.error( 'Please enter new email address',"Email is already exists");
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      }
    );
    this.dialogRef.close(item);
  }
}
