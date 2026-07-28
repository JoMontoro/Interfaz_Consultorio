import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'panel-principal',
    canActivate: [authGuard],
    loadComponent: () =>
<<<<<<< HEAD
      import('./features/dashboard/panel-principal/panel-principal')
        .then(m => m.PanelPrincipal)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/perfil')
        .then(m => m.PerfilComponent)
  },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/pacientes/pacientes.routes')
        .then(m => m.PACIENTES_ROUTES)
=======
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'pacientes',
    loadChildren: () =>
      import('./modules/pacientes/pacientes-module').then(m => m.PacientesModule)
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'citas',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'tratamientos',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'historial-clinico',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'odontograma',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./modules/panel-principal/panel-principal').then(m => m.PanelPrincipal)
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
