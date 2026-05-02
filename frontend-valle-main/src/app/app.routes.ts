import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/usuarios/login/login.page')
      .then(m => m.LoginPage)
  },
  {
    path: 'emergencias',
    loadComponent: () => import('./pages/emergencias/emergencias.page')
      .then(m => m.EmergenciasPage)
  }
];