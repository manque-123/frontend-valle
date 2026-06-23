import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/usuarios/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./modules/usuarios/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'admin-emergencias',
    loadComponent: () => import('./pages/admin-emergencias/admin-emergencias.page').then(m => m.AdminEmergenciasPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

