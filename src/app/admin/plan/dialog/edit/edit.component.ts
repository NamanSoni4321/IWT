import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "src/app/Auth/auth.service";
import { ToastrService } from "ngx-toastr";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Items, plan } from "src/app/admin/interface/plan.interface";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class EditComponent implements OnInit {
  editPlan!: FormGroup

  constructor(
    public dialogRef: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: plan,
    public dialogService: MatDialog,
    private fb: FormBuilder,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) {
  }
  ngOnInit(): void {
    this.editPlan = this.fb.group({
      name: [this.data.name, [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
      price: [this.data.price, [Validators.required, Validators.pattern('^[0-9]+$')]]
    })
  }

  onSubmit() {
    this.ngxloader.start();
    const item: Items = {
      id: this.data.id,
      name: this.editPlan.value.name.trim(),
      price: this.editPlan.value.price,
      status: false
    }
    this.dataService.updatePlan(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success("Plan updated successfully");
      },
      (error) => {
        this.ngxloader.stop();
        console.error("Error posting data:", error);
        if (error && error.error) {
          this.toastr.error("Please try again later", "Plan currently in use")
        } else {
          this.toastr.error("An error occurred while fetching data.", "Error");
        }
      }
    );
    this.dialogRef.close(item);
  }
}
