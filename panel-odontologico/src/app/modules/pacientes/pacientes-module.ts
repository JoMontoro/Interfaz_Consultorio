import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListarPacientes } from './pages/listar-pacientes/listar-pacientes';
import { CrearPaciente } from './pages/crear-paciente/crear-paciente';
import { EditarPaciente } from './pages/editar-pacientes/editar-pacientes';
import { DetallePaciente } from './pages/paciente-detalle/paciente-detalle';

const routes: Routes = [
  { path: '', component: ListarPacientes },
  { path: 'crear', component: CrearPaciente },
  { path: 'editar/:id', component: EditarPaciente },
  { path: 'detalle/:id', component: DetallePaciente }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacientesModule { }
