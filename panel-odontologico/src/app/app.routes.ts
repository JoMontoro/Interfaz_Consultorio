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
  },
  {
    path: 'citas',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/citas/citas.routes')
        .then(m => m.CITAS_ROUTES)
  },
  {
    path: 'tratamientos',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/tratamientos/tratamientos.routes')
        .then(m => m.TRATAMIENTOS_ROUTES)
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
