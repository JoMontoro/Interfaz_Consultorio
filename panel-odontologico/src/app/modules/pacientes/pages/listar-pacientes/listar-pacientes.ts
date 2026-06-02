import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../../../../module/pacientes/services/paciente';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listar-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar-pacientes.html',
  styleUrls: ['./listar-pacientes.css'],
})
export class ListarPacientes implements OnInit {

  Lista: any[] = [];
  pagina=0;
  size =10;
  totalPages = 0;
  constructor(private service: PacienteService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes() {

    this.service
      .listarPaginado(
        this.pagina,
        this.size
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

  eliminar(id: number) {

    if(confirm('¿Eliminar paciente?')) {

      this.service.eliminar(id).subscribe({

        next: () => {
          alert('Paciente eliminado');
          this.cargarPacientes();
        },

        error: (err: any) => {
          console.error(err);
        }

      });
    }
  }
}