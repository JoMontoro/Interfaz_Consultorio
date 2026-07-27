import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  loading = true;
  fechaHoy = new Date();
  pacientesPagina = 0;
  pacientesPorPagina = 5;

  ngOnInit(): void {
    const auth = btoa('odontologo:123456');
    fetch('http://localhost:8088/api/pacientes?page=0&size=50', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data: any) => {
      const lista: any[] = data.content || [];
      this.pacientesLista = lista.map((p: any) => ({
        id_paciente: p.id_paciente || p.id,
        id: p.id,
        nombre: (p.nombre || '') + ' ' + (p.apellido || ''),
        ultimaVisita: p.ultimaVisita || p.fecha_registro || p.fecha_creacion || '—'
      }));
      this.loading = false;
    })
    .catch(() => {
      this.loading = false;
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

  obtenerIdPaciente(item: any): number {
    return item.id_paciente || item.id;
  }

  trackPorId(_index: number, item: any): number {
    return this.obtenerIdPaciente(item) || _index;
  }

  trackPorHora(_index: number, item: any): string {
    return item.hora || _index.toString();
  }
}
