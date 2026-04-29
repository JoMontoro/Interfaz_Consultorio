import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListarPacientes } from './pages/listar-pacientes/listar-pacientes';
import { CrearPaciente } from './pages/crear-paciente/crear-paciente';



const routes: Routes = [
  { path: '', component: ListarPacientes },
  { path: 'crear', component: CrearPaciente }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacientesModule { }
