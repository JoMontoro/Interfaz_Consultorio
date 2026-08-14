import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CitaService } from '../../../../core/services/cita';
import { PacienteService } from '../../../../core/services/paciente';

export const TIPOS_CITA = ['CONSULTA', 'DIAGNOSTICO', 'TRATAMIENTO', 'CONTROL', 'EMERGENCIA'];
export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO'];

@Component({
  selector: 'app-listar-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listar-citas.html',
  styleUrls: ['./listar-citas.css'],
})
export class ListarCitas implements OnInit {

  Lista: any[] = [];
  filtroEstado = '';
  termino = '';
  pagina = 0;
  size = 10;
  totalPages = 0;

  showModal = false;
  showEditModal = false;
  showDetailModal = false;
  verCita: any = null;

  form: any = {};

  pacientes: any[] = [];
  casos: any[] = [];
  odontologos: any[] = [];

  editarId!: number;

  constructor(private service: CitaService, private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarPacientes();
    this.cargarOdontologos();
  }

  cargarCitas() {
    this.service.listar(this.pagina, this.size, this.termino, this.filtroEstado).subscribe({
      next: (data) => {
        this.Lista = data?.content || [];
        this.totalPages = data?.totalPages || 0;
        if (this.Lista.length === 0 && this.pagina > 0) {
          this.pagina--;
          this.cargarCitas();
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar las citas', 'error');
      }
    });
  }

  buscar() {
    this.pagina = 0;
    this.cargarCitas();
  }

  siguientePagina() {
    if (this.pagina < this.totalPages - 1) {
      this.pagina++;
      this.cargarCitas();
    }
  }

  paginaAnterior() {
    if (this.pagina > 0) {
      this.pagina--;
      this.cargarCitas();
    }
  }

  cargarPacientes() {
    this.pacienteService.listarPaginado(0, 1000, true).subscribe({
      next: (data: any) => {
        this.pacientes = data?.content || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  cargarOdontologos() {
    this.service.listarOdontologos().subscribe({
      next: (data) => {
        this.odontologos = data || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  cargarCasos(pacienteId: number) {
    this.casos = [];
    this.form.casoClinicoId = null;
    if (!pacienteId) return;
    this.service.listarCasos(pacienteId).subscribe({
      next: (data) => {
        this.casos = data || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  eliminarCita(id: number) {
    Swal.fire({
      title: '¿Eliminar cita?',
      text: 'El registro se eliminará de forma permanente de la base de datos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Cita eliminada correctamente', 'success');
            this.cargarCitas();
          },
          error: (err) => {
            console.error(err);
            const mensaje = err?.error?.mensaje || 'No se pudo eliminar la cita';
            Swal.fire('Error', mensaje, 'error');
          }
        });
      }
    });
  }

  abrirModal() {
    this.form = {
      pacienteId: null,
      casoClinicoId: null,
      odontologoId: null,
      fecha: '',
      horaInicio: '',
      horaFin: '',
      tipo: 'CONSULTA',
      estado: 'PROGRAMADA',
      observaciones: ''
    };
    this.casos = [];
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.form = {};
    this.casos = [];
  }

  guardarCita() {
    if (!this.form.pacienteId || !this.form.casoClinicoId || !this.form.odontologoId) {
      Swal.fire('Faltan datos', 'Selecciona paciente, caso clínico y odontólogo', 'warning');
      return;
    }
    this.service.crear(this.construirPayload()).subscribe({
      next: () => {
        Swal.fire('Creada', 'Cita registrada correctamente', 'success');
        this.cerrarModal();
        this.cargarCitas();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar la cita', 'error');
      }
    });
  }

  abrirEditar(id: number) {
    this.editarId = id;
    this.service.obtener(id).subscribe({
      next: (cita) => {
        this.form = {
          pacienteId: cita.paciente?.id,
          casoClinicoId: null,
          odontologoId: cita.odontologo?.id,
          fecha: cita.fecha,
          horaInicio: (cita.horaInicio || '').slice(0, 5),
          horaFin: (cita.horaFin || '').slice(0, 5),
          tipo: cita.tipo || 'CONSULTA',
          estado: cita.estado || 'PROGRAMADA',
          observaciones: cita.observaciones || ''
        };
        this.cargarCasos(cita.paciente?.id);
        setTimeout(() => {
          this.form.casoClinicoId = cita.casoClinico?.id;
        }, 0);
        this.showEditModal = true;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar la cita', 'error');
      }
    });
  }

  cerrarEditar() {
    this.showEditModal = false;
    this.form = {};
    this.casos = [];
  }

  actualizarCita() {
    if (!this.form.casoClinicoId || !this.form.odontologoId) {
      Swal.fire('Faltan datos', 'Selecciona caso clínico y odontólogo', 'warning');
      return;
    }
    this.service.actualizar(this.editarId, this.construirPayload()).subscribe({
      next: () => {
        Swal.fire('Actualizada', 'Cita actualizada correctamente', 'success');
        this.cerrarEditar();
        this.cargarCitas();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar la cita', 'error');
      }
    });
  }

  cancelarCita(id: number) {
    Swal.fire({
      title: '¿Cancelar cita?',
      text: 'La cita quedará marcada como cancelada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cancelar(id).subscribe({
          next: () => {
            Swal.fire('Cancelada', 'Cita cancelada correctamente', 'success');
            this.cargarCitas();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo cancelar la cita', 'error');
          }
        });
      }
    });
  }

  verDetalle(cita: any) {
    this.verCita = cita;
    this.showDetailModal = true;
  }

  cerrarDetalle() {
    this.showDetailModal = false;
    this.verCita = null;
  }

  private construirPayload(): any {
    return {
      casoClinico: { id: this.form.casoClinicoId },
      paciente: { id: this.form.pacienteId },
      odontologo: { id: this.form.odontologoId },
      fecha: this.form.fecha,
      horaInicio: this.form.horaInicio,
      horaFin: this.form.horaFin,
      tipo: this.form.tipo,
      estado: this.form.estado,
      observaciones: this.form.observaciones
    };
  }

  nombrePaciente(cita: any): string {
    return cita?.paciente ? `${cita.paciente.nombre} ${cita.paciente.apellido}`.trim() : '—';
  }

  nombreOdontologo(cita: any): string {
    return cita?.odontologo ? `${cita.odontologo.nombre} ${cita.odontologo.apellido}`.trim() : '—';
  }

  motivo(cita: any): string {
    return cita?.casoClinico?.motivoConsulta || '—';
  }

  horaLabel(h: string): string {
    return h ? h.slice(0, 5) : '—';
  }

  tipoLabel(tipo: string): string {
    const map: Record<string, string> = {
      CONSULTA: 'Consulta',
      DIAGNOSTICO: 'Diagnóstico',
      TRATAMIENTO: 'Tratamiento',
      CONTROL: 'Control',
      EMERGENCIA: 'Emergencia'
    };
    return map[tipo] || tipo;
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PROGRAMADA: 'Programada',
      CONFIRMADA: 'Confirmada',
      EN_ATENCION: 'En atención',
      FINALIZADA: 'Finalizada',
      CANCELADA: 'Cancelada',
      NO_ASISTIO: 'No asistió'
    };
    return map[estado] || estado;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      FINALIZADA: 'bg-success-subtle text-success',
      PROGRAMADA: 'bg-warning-subtle text-warning',
      CONFIRMADA: 'bg-primary-subtle text-primary',
      EN_ATENCION: 'bg-info-subtle text-info',
      CANCELADA: 'bg-danger-subtle text-danger',
      NO_ASISTIO: 'bg-secondary-subtle text-secondary'
    };
    return map[estado] || 'bg-secondary-subtle text-secondary';
  }

}