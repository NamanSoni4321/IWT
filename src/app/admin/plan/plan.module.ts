import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule as FormModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PlanRoutingModule } from './plan-routing.module';
import { HomeComponent } from './home/home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AddComponent } from './dialog/add/add.component';
import { EditComponent } from './dialog/edit/edit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from 'src/app/Auth/auth.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatCardModule} from '@angular/material/card';

@NgModule({
  imports: [
    SharedModule,
    PlanRoutingModule,
    FormModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatCardModule,
  ],
  declarations: [
    HomeComponent,
    AddComponent,
    EditComponent,
  ],
  bootstrap: [HomeComponent],
  entryComponents: [HomeComponent],
  providers: [AuthService]
})
export class PlanModule {}
