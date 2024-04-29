import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Items, plan } from 'src/app/admin/interface/plan.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  addPlan!: FormGroup
  
  constructor(public dialogRef: MatDialogRef<AddComponent>,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.addPlan = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    })
  }

  onSubmit(): void {
    this.ngxloader.start();
    const item: Items = {
      name: this.addPlan.value.name.trim(),
      price: this.addPlan.value.price
    }
    this.dataService.createPlan(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Plan added successfully')
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error && error.error) {
          this.toastr.error('Please enter a new plan name','Plan name already exists')
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      }
    );
    this.dialogRef.close(item);
  }
}
