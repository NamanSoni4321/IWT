import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { MatSelect } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PlanPurchase } from 'src/app/admin/enums/roles.enum';
import { createProject, project } from 'src/app/admin/interface/project.interface';
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  @ViewChild('select') select: MatSelect;
  @ViewChild('projectNameInput') projectNameInput: ElementRef;

  public projectForm: FormGroup;
  public selectedCustomer;
  public allSelected: boolean = false;
  public showForm: boolean = false;
  public items = [];
  public filteredItems = [];
  public meta = {};
  public totalItems: number = 0;
  public currentPage: number = 1;
  // public filteredList2

  constructor(public dialogRef: MatDialogRef<AddComponent>,
    private dataService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngxloader: NgxUiLoaderService) { }

  ngOnInit() {
    this.getCustomerFromBackend();
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9 ]*$')]],
    })
  }

  materials = [
    { value: 1, viewValue: 'Cement' },
    { value: 2, viewValue: 'Reti' },
    { value: 3, viewValue: 'Brick' },
    { value: 4, viewValue: 'Steel' },
    { value: 5, viewValue: 'Concrete mix' },

  ];

  onCustomerSelected() {
    this.showForm = !!this.selectedCustomer;
  }

  onSubmit(): void {
    this.ngxloader.start();
    const dataToSubmit: createProject = {
      projectName: this.projectForm.value.name.trim(),
      items: this.select.value,
      userId: this.selectedCustomer.id,
      assignUser: "demo",
      isEnable: true,
      planId: PlanPurchase.FREE
    };
    this.dataService.projectCustomer(dataToSubmit).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.toastr.success('Project Added Successfully');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error.error.error == "DUPLICATE_PROJECT_NAME_NOT_ALLOW") {
          this.toastr.error('Project name is already exists', 'Please try another project name');
        } else {
          this.toastr.error('You reached your maximum limit', 'Please uprade your plan');
        }
      }
    );
    this.dialogRef.close(dataToSubmit);
  }

  getCustomerFromBackend(): void {
    const filterData = {
      page: this.currentPage,
      limit: this.totalItems
    }
    this.dataService.getCustomerProject(filterData).subscribe(
      (data) => {
        this.items = data.body.items;
        this.filteredItems = data.body.items.filter((customer) => customer.isCompleted === true);
        //  this.filteredList2 = this.filteredItems.slice();      
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}

