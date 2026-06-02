import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login').then(m => m.LoginComponent)
  },
   {
    path: 'panel-principal',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal')
        .then(m => m.PanelPrincipal)
  },
  {
    path: 'pacientes',
    loadChildren: () =>
      import('./modules/pacientes/pacientes-module')
        .then(m => m.PacientesModule)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];