import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PacienteService }
from '../../../../core/services/paciente';

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-detalle.html',
  styleUrls: ['./paciente-detalle.css']
})
export class DetallePaciente
implements OnInit {

  tab = 'datos';

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

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );
     console.log('ID:', id);

  if (id) {

    this.cargarPaciente(id);

  }

  }

  cargarPaciente(id: number) {

    this.pacienteService
      .obtenerDetalle(id)
      .subscribe({

        next: (data: any) => {

          console.log(data);

          this.paciente =
            data.paciente || {};

          this.historial =
            data.historial || {};

          this.diagnostico =
            data.diagnostico || {};

          this.presupuesto =
            data.presupuesto || {};

          this.tratamientos =
            data.tratamientos || [];

          this.evoluciones =
            data.evoluciones || [];

        },

        error: (err: any) => {
          console.error(err);
        }

      });

  }

}