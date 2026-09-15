import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';
import { CitaService } from '../../../core/services/cita';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.css']
})
export class PanelPrincipal implements OnInit {

  data: DashboardData | null = null;
  totalCitas = 0;
  loading = true;
  fechaHoy = '';

  private dashboardService = inject(DashboardService);
  authService = inject(AuthService);
  private citaService = inject(CitaService);

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
        this.cargarTotalCitas();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private cargarTotalCitas(): void {
    this.citaService.listar(0, 1).subscribe({
      next: (response: any) => {
        this.totalCitas = response?.totalElements ?? response?.total ?? response?.content?.length ?? 0;
      },
      error: () => {
        this.totalCitas = 0;
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
