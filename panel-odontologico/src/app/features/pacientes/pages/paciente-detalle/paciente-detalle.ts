import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../../../core/services/paciente';
import { CasoClinicoService } from '../../../../core/services/caso-clinico';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paciente-detalle.html',
  styleUrls: ['./paciente-detalle.css']
})
export class DetallePaciente implements OnInit {

  tab: string = 'datos';
  loading = true;

  tabs = [
    { key: 'datos', label: 'Datos' },
    { key: 'historial', label: 'Historial' },
    { key: 'odontograma', label: 'Odontograma' },
    { key: 'casos', label: 'Casos Clínicos' },
    { key: 'diagnostico', label: 'Diagnóstico' },
    { key: 'tratamiento', label: 'Tratamiento' },
    { key: 'presupuesto', label: 'Presupuesto' },
    { key: 'evolucion', label: 'Evolución' }
  ];

  paciente: any = {};
  historial: any = {};
  diagnostico: any = {};
  presupuesto: any = {};
  tratamientos: any[] = [];
  evoluciones: any[] = [];
  casos: any[] = [];
  showModal = false;
  nuevoMotivo = '';

  showEditModal = false;
  editForm: any = {};

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private casoClinicoService: CasoClinicoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarPaciente(id);
      this.cargarCasos(id);
    }
  }

  cargarPaciente(id: number) {
    this.loading = true;
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
        this.loading = false;
      }
    });
  }

  cargarCasos(id: number) {
    this.casoClinicoService.listarPorPaciente(id).subscribe({
      next: (data) => this.casos = data,
      error: () => this.casos = []
    });
  }

  abrirModal() {
    this.nuevoMotivo = '';
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  crearCaso() {
    if (!this.nuevoMotivo.trim()) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.casoClinicoService.crear(id, { motivoConsulta: this.nuevoMotivo }).subscribe({
      next: () => {
        this.showModal = false;
        Swal.fire('Creado', 'Caso clínico creado correctamente', 'success');
        this.cargarCasos(id);
      },
      error: () => Swal.fire('Error', 'No se pudo crear el caso', 'error')
    });
  }

  abrirEditModal() {
    this.editForm = { ...this.paciente };
    this.showEditModal = true;
  }

  cerrarEditModal() {
    this.showEditModal = false;
  }

  guardarEdicion() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pacienteService.actualizar(id, this.editForm).subscribe({
      next: () => {
        this.showEditModal = false;
        Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
        this.cargarPaciente(id);
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el paciente', 'error')
    });
  }

  cancelarCaso(id: number) {
    Swal.fire({
      title: '¿Cancelar caso?',
      text: 'El caso se marcará como cancelado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((res) => {
      if (res.isConfirmed) {
        this.casoClinicoService.cancelar(id).subscribe({
          next: () => {
            Swal.fire('Cancelado', 'Caso cancelado', 'success');
            this.cargarCasos(Number(this.route.snapshot.paramMap.get('id')));
          },
          error: () => Swal.fire('Error', 'No se pudo cancelar', 'error')
        });
      }
    });
  }

  estadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      EN_PROCESO: 'bg-primary',
      SUSPENDIDO: 'bg-warning text-dark',
      FINALIZADO: 'bg-success',
      CANCELADO: 'bg-secondary'
    };
    return map[estado] || 'bg-secondary';
  }

}
