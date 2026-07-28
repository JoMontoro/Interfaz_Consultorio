import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PacienteService } from '../../../../core/services/paciente';

@Component({
  selector: 'app-editar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-pacientes.html',
  styleUrls: ['./editar-pacientes.css']
})
export class EditarPaciente implements OnInit {

  paciente: any = {};
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PacienteService
  ) {}

  ngOnInit(): void {
    // Obtener el id desde la URL
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar datos del paciente
    this.service.obtener(this.id).subscribe({
      next: (data) => {
        this.paciente = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  actualizar(): void {
    this.service.actualizar(this.id, this.paciente).subscribe({
      next: () => {
        alert('Paciente actualizado correctamente');
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
    cancelar(){
   this.router.navigate(['/pacientes']);
  }
}