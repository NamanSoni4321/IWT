import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/Auth/auth.service';
import { Location, PlanPurchase } from 'src/app/admin/enums/roles.enum';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  @ViewChild('selectMaterial') selectMaterial: MatSelect;
  @ViewChild('selectItem') selectItem: MatSelect;

  public id: number;
  public userId: number;
  public project: string;
  public selectedMaterial;
  public materialForm!: FormGroup
  public formSubmitted!: boolean;
  public selectedImage: string | ArrayBuffer | null = null;

  constructor(private route: ActivatedRoute,
    private dataService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngxloader: NgxUiLoaderService) { }

  buildForm() {
    this.materialForm = this.fb.group({
      address: ['', Validators.required],
      quantity: ['', [Validators.required]]
    })
  }

  isFieldInvalid(field: string) {
    return (
      (!this.materialForm.get(field)?.valid && this.materialForm.get(field)?.touched) ||
      (this.materialForm.get(field)?.untouched && this.formSubmitted)
    );
  }

  ngOnInit(): void {
    this.ngxloader.start();
    this.id = this.route.snapshot.params['id'];
    this.route.queryParams.subscribe(params => {
      const selectedMaterial = params['material'];
      if (selectedMaterial) {
        this.selectedMaterial = selectedMaterial;
        this.updateItemsDropdown();
      }
    });
    this.buildForm();
    this.getProjectInfo();

    // Initialize filePreview and fileInput properties
    this.filePreview = document.querySelector('img[data-id=filePreview]') as HTMLImageElement;
    this.fileInput = document.querySelector('input[data-id=fileInput]') as HTMLInputElement;

    // Attach event listeners
    this.attachEventListeners();
    this.ngxloader.stop();
  }

  Materials  = [
    { value: '1', viewValue: 'Cement' },
    { value: '2', viewValue: 'Reti' },
    { value: '3', viewValue: 'Brick' },
    { value: '4', viewValue: 'Steel' },
    { value: '5', viewValue: 'Concrete mix' }
  ];

  Items = [
    { value: '1', viewValue: 'Bag' },
    { value: '2', viewValue: 'Tali' },
    { value: '3', viewValue: 'Truck' },
    { value: '4', viewValue: 'Tali' },
    { value: '5', viewValue: 'Number' },
    { value: '6', viewValue: 'Kg' },
    { value: '7', viewValue: 'Tali' },
    { value: '8', viewValue: 'Ton' },
    { value: '9', viewValue: 'Truck' },

  ]
  selectedItems = this.Items[0].value;
  filteredItems = this.Items; 

  /* Function to filter items based on selectedMaterial */
  updateItemsDropdown() {
    switch (this.selectedMaterial) {
      case '1':
        this.filteredItems = this.Items.filter((item) => ['1'].includes(item.value));
        break;
      case '2':
        this.filteredItems = this.Items.filter((item) => ['2', '3'].includes(item.value));
        break;
      case '3':
        this.filteredItems = this.Items.filter((item) => ['4', '5'].includes(item.value));
        break;
      case '4':
        this.filteredItems = this.Items.filter((item) => ['6', '7', '8'].includes(item.value));
        break;
      default:
        this.filteredItems = this.Items;
    }
    this.selectedItems = this.filteredItems[0].value;
  }

  filePreview: HTMLImageElement;
  fileInput: HTMLInputElement;
  validImgFormats: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  attachEventListeners(): void {
    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileUpload, false);
    }
  }

  handleFileUpload = (inputEvent: Event) => {
    const input = inputEvent.target as HTMLInputElement;
    const reader = new FileReader();
    if (this.validImgFormats.indexOf(input.files[0].type) === -1) {
      return alert('Please provide a valid image file. Accepted formats include .png, .jpg, and .gif.');
    }
    reader.readAsDataURL(input.files[0]);
    reader.onload = (readerEvent) => {
      this.filePreview.src = readerEvent.target.result as string;
    };
  }

  submit() {
    if (this.materialForm.invalid) {
      this.toastr.warning('Please fill the form')
      return;
    };
    this.ngxloader.start();
    this.formSubmitted = true;
    /* append data into form data */
    const formData = new FormData();
    formData.append('quantity', this.materialForm.value.quantity);
    formData.append('orderMaterialId', this.selectedMaterial);
    formData.append('address', this.materialForm.value.address);
    formData.append('typeId', this.selectedItems);
    formData.append('projectId', this.id.toString());
    formData.append('userId', this.userId.toString());
    formData.append('planId', PlanPurchase.MONTHLY.toString());
    formData.append('latitude', Location.latitude.toString());
    formData.append('longitude', Location.longitude.toString());
    formData.append('angle', Location.angle.toString());

    /* Get the selected image file */
    const file = (document.querySelector('input[data-id=fileInput]') as HTMLInputElement).files[0];
    if (file) {
      formData.append('liveFileUrl', file);
    }

    this.dataService.saveMaterialEntry(formData).subscribe(
      (response) => {
        this.ngxloader.stop();
        this.router.navigate([`/project/project-info/${this.id}`])
        this.toastr.success('Save Material successfully');
      },
      (error) => {
        this.ngxloader.stop();
        console.error('Error posting data:', error);
        if (error && error.error) {
          this.toastr.error(JSON.stringify(error.error.error), 'Error');
        } else {
          this.toastr.error(JSON.stringify(error.error.message), 'Error');
          this.toastr.error('An error occurred while fetching data.', 'Error');
        }
      })
  }

  getProjectInfo() {
    this.dataService.getProjectById(this.id).subscribe((data) => {
      this.project = data.projectName;
      this.userId = data.userId;
    }),
      catchError((error) => {
        console.error('Error fetching data:', error);
        return of([]);
      })
  }

}