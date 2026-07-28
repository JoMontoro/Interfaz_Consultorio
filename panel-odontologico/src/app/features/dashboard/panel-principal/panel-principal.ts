import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard';
import { AuthService } from '../../../core/services/auth';

export interface DashboardStats {
  citasCompletadas?: number;
  citasPendientes?: number;
  pacientesNuevos?: number;
  casosActivos?: number;
  facturacionMensual?: number;
  citasHoy?: any[];
  pacientesRecientes?: any[];
}

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.css']
})
export class PanelPrincipal implements OnInit {

  dashboard: DashboardStats = {};
  loading = true;
  fechaHoy = this.formatearFecha(new Date());

  private dashboardService = inject(DashboardService);
  authService = inject(AuthService);

  private formatearFecha(date: Date): string {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (data: DashboardStats) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.loading = false;
      }
    });
  }
}
