import { Routes } from '@angular/router';

export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listar-pacientes/listar-pacientes')
        .then(m => m.ListarPacientes)
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/crear-paciente/crear-paciente')
        .then(m => m.CrearPaciente)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/editar-pacientes/editar-pacientes')
        .then(m => m.EditarPaciente)
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/paciente-detalle/paciente-detalle')
        .then(m => m.DetallePaciente)
  },
  {
    path: 'odontograma/:id',
    loadComponent: () =>
      import('./pages/odontograma-paciente/odontograma-paciente')
        .then(m => m.OdontogramaPaciente)
  }
];
