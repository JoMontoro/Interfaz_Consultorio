import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../../../core/services/paciente';
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
  size =10;
  totalPages = 0;
  showModal = false;
  showEditModal = false;
  mostrarOcultos = false;
  nuevoPaciente: any = {};
  editarPaciente: any = {};
  editarId!: number;

  constructor(private service: PacienteService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  toggleOcultos() {
    this.mostrarOcultos = !this.mostrarOcultos;
    this.pagina = 0;
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.service
      .listarPaginado(
        this.pagina,
        this.size,
        this.mostrarOcultos ? undefined : true
      )
      .subscribe({

        next: (data: any) => {

          console.log(data);

          this.Lista =
            data.content;

          this.totalPages =
            data.totalPages;

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
  }

  guardarPaciente() {
    this.service.crear(this.nuevoPaciente).subscribe({
      next: () => {
        Swal.fire('Creado', 'Paciente registrado correctamente', 'success');
        this.cerrarModal();
        this.cargarPacientes();
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

  eliminar(id: number) {
    Swal.fire({
      title: '¿Desactivar paciente?',
      text: 'El paciente quedará oculto de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Desactivado', 'Paciente desactivado correctamente', 'success');
            this.cargarPacientes();
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo desactivar el paciente', 'error');
          }
        });
      }
    });
  }
}