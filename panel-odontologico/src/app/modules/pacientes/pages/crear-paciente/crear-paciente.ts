import { Component } from '@angular/core';
import {PacienteService} from '../../../../module/pacientes/services/paciente';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-paciente',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './crear-paciente.html',
  styleUrl: './crear-paciente.css',
})
export class CrearPaciente {
paciente = {
  nombre: '',
  apellido: '',
  edad: null,
  telefono: '',
  email: '',
  dni: ''
}
constructor(private service: PacienteService, private router: Router) {}

  guardar() {
   console.log(this.paciente); // 👈 para verificar datos

  this.service.crear(this.paciente).subscribe({
    next: () => {
      alert('Paciente creado correctamente');
      
     this.router.navigate(['/pacientes']);

    },

    error: (err) => {
      console.error(err);
      alert('Error al guardar');
    }
    });
  }
}
