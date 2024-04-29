import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  public editDetails!: boolean;
  public selectedImage: string | ArrayBuffer | null = null;
  public getEmail = JSON.parse(localStorage.getItem('user'));
  public showPassword!: boolean;

  constructor(public dialogService: MatDialog) {}

  onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      this.previewImage(file);
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  edit_Details() { this.editDetails = !this.editDetails}

  openDialog() :void{  
    const dialogConfig = new MatDialogConfig;
    dialogConfig.width = "450px"
    const dialogRef = this.dialogService.open(ChangePasswordComponent,dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
    });
  }
}
