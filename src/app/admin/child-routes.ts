
export const childRoutes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { icon: 'dashboard', text: 'Dashboard'}
  },
  {
    path: 'customer',
    loadChildren: () => import('./Customer/Customer.module').then(m => m.CustomerModule),
    data: { icon: 'bar_chart', text: 'Customer' }
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
    data: { icon: 'table_chart', text: 'Project' }
  },
  {
    path: 'plan',
    loadChildren: () => import('./plan/plan.module').then(m => m.PlanModule),
    data: { icon: 'assignment', text: 'Plan'}
  },
  {
    path:'setting',
    loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule),
    data: { icon: 'settings', text: 'Setting' }
  },
  {
    path:'theme',
    loadChildren: () => import('./theme/theme.module').then(m => m.ThemeModule),
    data: { icon: 'build', text: 'Theme' }
  }
];
