import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './dialog/info/info.component';
import { ProjectInfoComponent } from './dialog/project-info/project-info.component';

const routes: Routes = [
  {path: '',component: HomeComponent},
  {path:'info/:id',component:InfoComponent},
  {path:'project-info/:id',component:ProjectInfoComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
