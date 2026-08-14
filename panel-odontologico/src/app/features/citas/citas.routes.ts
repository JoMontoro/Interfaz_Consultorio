import { Routes } from '@angular/router';

export const CITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listar-citas/listar-citas')
        .then(m => m.ListarCitas)
  }
];