import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/usuarios/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  // --- AÑADE ESTA RUTA AQUÍ ABAJO ---
  {
    path: 'emergencias',
    loadComponent: () => import('./pages/emergencias/emergencias.page').then( m => m.EmergenciasPage)
  },
];