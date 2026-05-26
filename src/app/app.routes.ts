import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/usuarios/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'emergencias',
    loadComponent: () => import('./pages/emergencias/emergencias.page').then( m => m.EmergenciasPage)
  },
  // ESTA ES LA LÍNEA QUE DEBE ESTAR:
  {
    path: 'registro',
    loadComponent: () => import('./modules/usuarios/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];