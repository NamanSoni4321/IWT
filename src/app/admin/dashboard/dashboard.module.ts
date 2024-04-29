import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { StatComponent } from './stat/stat.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { AuthService } from 'src/app/Auth/auth.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatGridListModule,
    FlexLayoutModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    NgChartsModule,
    ClipboardModule,
    MatTooltipModule
  ],
  declarations: [
    HomeComponent,
    StatComponent,
    ProfileComponent,
    PieChartComponent,
    LineChartComponent,
    ChangePasswordComponent
  ],
  providers: [AuthService]
})
export class DashboardModule { }
