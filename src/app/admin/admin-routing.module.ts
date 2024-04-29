import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { childRoutes } from './child-routes';
import { TransactionHistoryComponent } from './service/transaction-history/transaction-history.component';
import { HireUsComponent } from './service/hire-us/hire-us.component';
import { QualityAssuranceComponent } from './service/quality-assurance/quality-assurance.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard'
      },
      {
        path: 'service/transaction',
        component: TransactionHistoryComponent
      },
      {
        path: 'service/hire-us',
        component: HireUsComponent
      },
      {
        path: 'service/qa',
        component: QualityAssuranceComponent
      },
      ...childRoutes
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
