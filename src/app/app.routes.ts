import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'setup/1', pathMatch: 'full' },
  {
    path: 'setup/1',
    loadComponent: () =>
      import('./features/setup/setup-step1/setup-step1.component').then(
        (m) => m.SetupStep1Component,
      ),
  },
  {
    path: 'setup/2',
    loadComponent: () =>
      import('./features/setup/setup-step2/setup-step2.component').then(
        (m) => m.SetupStep2Component,
      ),
  },
  {
    path: 'setup/3',
    loadComponent: () =>
      import('./features/setup/setup-step3/setup-step3.component').then(
        (m) => m.SetupStep3Component,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  { path: '**', redirectTo: 'setup/1' },
];
