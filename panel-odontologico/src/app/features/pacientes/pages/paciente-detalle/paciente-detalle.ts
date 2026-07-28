import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD:panel-odontologico/src/app/features/pacientes/pages/paciente-detalle/paciente-detalle.ts
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PacienteService }
from '../../../../core/services/paciente';
=======
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../../../module/pacientes/services/paciente';
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da:panel-odontologico/src/app/modules/pacientes/pages/paciente-detalle/paciente-detalle.ts

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-detalle.html',
  styleUrls: ['./paciente-detalle.css']
})
export class DetallePaciente implements OnInit {

  tab = 'datos';
  loading = true;
  error = false;

  paciente: any = {};
  historial: any = {};
  diagnostico: any = {};
  presupuesto: any = {};
  tratamientos: any[] = [];
  evoluciones: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarPaciente(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  cargarPaciente(id: number) {
    this.loading = true;
    this.error = false;
    this.pacienteService.obtenerDetalle(id).subscribe({
      next: (data: any) => {
        this.paciente = data.paciente || {};
        this.historial = data.historial || {};
        this.diagnostico = data.diagnostico || {};
        this.presupuesto = data.presupuesto || {};
        this.tratamientos = data.tratamientos || [];
        this.evoluciones = data.evoluciones || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
