import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/Auth/auth.service';
import { createProject } from 'src/app/admin/interface/project.interface';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  editProject!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) public data:createProject,
    private _formBuilder: FormBuilder,
    private dataService: AuthService,
    private toastr: ToastrService,
    private ngxloader: NgxUiLoaderService) {
  }

  ngOnInit(): void {
    this.editProject = this._formBuilder.group({
      projectName: [this.data.projectName, [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
    });
  }

  onSubmit(): void {
    this.ngxloader.start();
    const item = {
      id: this.data.id,
      projectName: this.editProject.value.projectName.trim(),
    }

    this.dataService.projectUpdate(item).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Project Updated Successfully');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error && error.error) {
          this.toastr.error( 'Please enter new Project Name',"Project Name is already exists");
        } else {
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      }
    );
    this.dialogRef.close(item);
  }


}
