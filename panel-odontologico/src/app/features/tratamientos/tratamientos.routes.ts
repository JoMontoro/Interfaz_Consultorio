import { Routes } from '@angular/router';

export const TRATAMIENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listar-tratamientos/listar-tratamientos')
        .then(m => m.ListarTratamientosComponent)
  }
];
