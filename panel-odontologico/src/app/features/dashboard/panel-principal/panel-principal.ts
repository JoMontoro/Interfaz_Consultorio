import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.css']
})
export class PanelPrincipal implements OnInit {

  data: DashboardData | null = null;
  loading = true;
  fechaHoy = '';

  private dashboardService = inject(DashboardService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.fechaHoy = this.formatearFecha(new Date());
    this.cargarDashboard();
  }

  private formatearFecha(date: Date): string {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }

  private cargarDashboard(): void {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      FINALIZADA: 'bg-success-subtle text-success',
      PROGRAMADA: 'bg-warning-subtle text-warning',
      CANCELADA: 'bg-danger-subtle text-danger',
      EN_PROCESO: 'bg-info-subtle text-info'
    };
    return map[estado] || 'bg-secondary-subtle text-secondary';
  }

  indicadorClass(estado: string): string {
    const map: Record<string, string> = {
      FINALIZADA: 'bg-success',
      PROGRAMADA: 'bg-warning',
      CANCELADA: 'bg-danger',
      EN_PROCESO: 'bg-info'
    };
    return map[estado] || 'bg-secondary';
  }

  trackPorId(_i: number, item: any): number {
    return item.id || item.idPaciente || _i;
  }

}
