import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacienteService } from '../../core/services/paciente';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.css']
})
export class PanelPrincipal implements OnInit {
  dashboard: any = null;
  pacientesLista: any[] = [];
  pacientesTotal = 0;
  loading = true;
  errorPacientes = '';
  fechaHoy = new Date();
  pacientesPagina = 0;
  pacientesPorPagina = 5;

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.loading = true;
    this.errorPacientes = '';
    this.pacienteService.listarPaginado(0, 100).subscribe({
      next: (data: any) => {
        const lista: any[] = Array.isArray(data) ? data : data.content || [];
        this.pacientesTotal = data.totalElements || lista.length;
        this.pacientesLista = lista.map((p: any) => ({
          id: p.id,
          nombre: (p.nombre || '') + ' ' + (p.apellido || ''),
          ultimaVisita: p.ultimaVisita || p.fecha_registro || p.fecha_creacion || '—'
        }));
        this.loading = false;
      },
      error: () => {
        this.errorPacientes = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8088';
        this.loading = false;
      }
    });
  }

  get pacientesPaginados() {
    const inicio = this.pacientesPagina * this.pacientesPorPagina;
    return this.pacientesLista.slice(inicio, inicio + this.pacientesPorPagina);
  }

  get totalPaginasPacientes() {
    if (!this.pacientesLista.length) return 0;
    return Math.ceil(this.pacientesLista.length / this.pacientesPorPagina);
  }

  get paginaActualPacientes() {
    return this.pacientesPagina + 1;
  }

  siguientePaginaPacientes() {
    if (this.pacientesPagina < this.totalPaginasPacientes - 1) {
      this.pacientesPagina++;
    }
  }

  anteriorPaginaPacientes() {
    if (this.pacientesPagina > 0) {
      this.pacientesPagina--;
    }
  }

  trackPorId(_index: number, item: any): number {
    return item.id || _index;
  }

  trackPorHora(_index: number, item: any): string {
    return item.hora || _index.toString();
  }
}
