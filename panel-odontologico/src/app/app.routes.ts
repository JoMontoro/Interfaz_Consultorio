import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pacientes',
    loadChildren: () =>
      import('./modules/pacientes/pacientes-module')
        .then(m => m.PacientesModule)
  },
  {
    path: '',
    redirectTo: 'pacientes',
    pathMatch: 'full'
  }
];