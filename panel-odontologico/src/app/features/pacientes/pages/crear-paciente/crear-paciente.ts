import { Component } from '@angular/core';
import {PacienteService} from '../../../../core/services/paciente';
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
  fechaNacimiento: '',
  apoderado: '',
  direccion:'',
  dni: '',
  telefono: '',
  email: ''
  
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
  if (!/^9\d{8}$/.test(this.paciente.telefono)) {

  alert('El teléfono debe iniciar con 9 y tener 9 dígitos');
  return;

}
  }
  cancelar(){
   this.router.navigate(['/pacientes']);
  }
  soloNumeros(event: any) {

  event.target.value =
    event.target.value.replace(/[^0-9]/g, '');

}
}
