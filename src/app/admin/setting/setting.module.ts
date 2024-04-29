import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingRoutingModule } from './setting-routing.module';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  imports: [
    CommonModule,
    SettingRoutingModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule
  ],
  declarations: [HomeComponent],
  providers: []
})
export class SettingModule { }
