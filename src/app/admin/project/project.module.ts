import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProjectRoutingModule } from './project-routing.module';
import { FormsModule as FormModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HomeComponent } from './home/home.component';
import { AddComponent } from './dialog/add/add.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InfoComponent } from './dialog/info/info.component';
import { ProjectInfoComponent } from './dialog/project-info/project-info.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectFilterModule } from 'mat-select-filter';
import { AuthService } from 'src/app/Auth/auth.service';
import { EditComponent } from './dialog/edit/edit.component';

@NgModule({
  imports: [
    CommonModule,
    ProjectRoutingModule,
    FormModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectFilterModule
  ],
  declarations: [
    HomeComponent,
    AddComponent,
    InfoComponent,
    ProjectInfoComponent,
    EditComponent],
  providers: [AuthService]
})
export class ProjectModule { }
