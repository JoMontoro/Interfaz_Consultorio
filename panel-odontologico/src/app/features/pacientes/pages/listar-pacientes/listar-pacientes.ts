import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../../../core/services/paciente';
import { CasoClinicoService } from '../../../../core/services/caso-clinico';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listar-pacientes.html',
  styleUrls: ['./listar-pacientes.css'],
})
export class ListarPacientes implements OnInit {

  Lista: any[] = [];
  pagina=0;
  size =100;
  totalPages = 0;
  totalRegistros = 0;
  showModal = false;
  showEditModal = false;
  mostrarOcultos = false;
  soloPendientes = false;
  nuevoPaciente: any = {};
  motivoConsultaNuevo = '';
  editarPaciente: any = {};
  editarId!: number;

  constructor(private service: PacienteService, private casoService: CasoClinicoService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  toggleOcultos() {
    this.mostrarOcultos = !this.mostrarOcultos;
    this.pagina = 0;
    this.cargarPacientes();
  }

  /**
   * Filtro opcional: por defecto se ven TODOS los pacientes, incluidos los que ya
   * pagaron su presupuesto o finalizaron el caso. Activarlo deja fuera solo a
   * los atendidos, sin borrarlos nunca del sistema.
   */
  togglePendientes() {
    this.soloPendientes = !this.soloPendientes;
    this.pagina = 0;
    this.cargarPacientes();
  }

  esAtendido(p: any): boolean {
    return p?.estadoAtencion === 'ATENDIDO';
  }

  cargarPacientes() {
    this.service
      .listarPaginado(
        this.pagina,
        this.size,
        this.mostrarOcultos ? undefined : true,
        !this.soloPendientes
      )
      .subscribe({

        next: (data: any) => {

          this.Lista =
            data.content;

          this.totalPages =
            data.totalPages;

          this.totalRegistros =
            data.totalElements;

        },

        error: (err: any) => {

          console.error(err);

        }

      });

  }

  siguientePagina() {

    if (
      this.pagina <
      this.totalPages - 1
    ) {

      this.pagina++;

      this.cargarPacientes();

    }

  }

  paginaAnterior() {

    if (
      this.pagina > 0
    ) {

      this.pagina--;

      this.cargarPacientes();

    }

  }

  abrirModal() {
    this.nuevoPaciente = {};
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.nuevoPaciente = {};
    this.motivoConsultaNuevo = '';
  }

  /**
   * Registra al paciente y, si escribio el motivo de consulta, crea el caso
   * clinico de una vez: asi el plan de tratamiento se puede generar de inmediato.
   */
  guardarPaciente() {
    const motivo = (this.motivoConsultaNuevo || '').trim();
    this.service.crear(this.nuevoPaciente).subscribe({
      next: (creado: any) => {
        if (!motivo || !creado?.id) {
          Swal.fire('Creado', 'Paciente registrado correctamente', 'success');
          this.cerrarModal();
          this.cargarPacientes();
          return;
        }
        this.casoService.crear(creado.id, { motivoConsulta: motivo }).subscribe({
          next: () => {
            Swal.fire('Paciente y caso creados',
              'Ya puede generar el plan de tratamiento desde la ficha', 'success');
            this.cerrarModal();
            this.cargarPacientes();
          },
          error: () => {
            Swal.fire('Paciente creado',
              'No se pudo crear el caso clínico;Puede agregarlo desde la ficha del paciente', 'warning');
            this.cerrarModal();
            this.cargarPacientes();
          }
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el paciente', 'error');
      }
    });
  }

  abrirEditar(id: number) {
    this.editarId = id;
    this.service.obtener(id).subscribe({
      next: (data) => {
        this.editarPaciente = { ...data };
        this.showEditModal = true;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el paciente', 'error');
      }
    });
  }

  cerrarEditar() {
    this.showEditModal = false;
    this.editarPaciente = {};
  }

  actualizarPaciente() {
    this.service.actualizar(this.editarId, this.editarPaciente).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
        this.cerrarEditar();
        this.cargarPacientes();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el paciente', 'error');
      }
    });
  }

  soloNumeros(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }

  buscar(event: any) {
    const term = event.target.value.toLowerCase();
    this.Lista = this.Lista.filter(p =>
      p.nombre?.toLowerCase().includes(term) ||
      p.apellido?.toLowerCase().includes(term) ||
      p.dni?.includes(term)
    );
    if (!term) this.cargarPacientes();
  }

  reactivar(id: number) {
    Swal.fire({
      title: '¿Reactivar paciente?',
      text: 'El paciente volverá a aparecer en la lista',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.reactivar(id).subscribe({
          next: () => {
            Swal.fire('Reactivado', 'Paciente reactivado correctamente', 'success');
            this.cargarPacientes();
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo reactivar el paciente', 'error');
          }
        });
      }
    });
  }

  /**
   * Oculta al paciente de la lista activa. Nunca borra: la ficha clinica y su
   * presupuesto se conservan, y reaparece con el filtro "Mostrar ocultos".
   */
  desactivar(id: number) {
    Swal.fire({
      title: '¿Ocultar paciente?',
      text: 'El paciente se ocultará de la lista. Su información no se elimina y se conserva para posibles consultas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, ocultar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.desactivar(id).subscribe({
          next: () => {
            Swal.fire('Ocultado', 'El paciente se ocultó de la lista. Su información se conserva para posibles consultas.', 'success');
            this.cargarPacientes();
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo ocultar el paciente', 'error');
          }
        });
      }
    });
  }
}