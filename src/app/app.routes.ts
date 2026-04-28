import { CanActivateFn, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PROFILE_KEY } from './services/nutrition.service';

@Component({ template: '', standalone: true })
class RootRedirectComponent {}

const profileRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  return router.createUrlTree([localStorage.getItem(PROFILE_KEY) ? '/dashboard' : '/setup/1']);
};

const requireProfileGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (localStorage.getItem(PROFILE_KEY)) return true;
  return router.createUrlTree(['/setup/1']);
};

export const routes: Routes = [
  { path: '', component: RootRedirectComponent, canActivate: [profileRedirectGuard] },
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
    canActivate: [requireProfileGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  { path: '**', redirectTo: 'setup/1' },
];
