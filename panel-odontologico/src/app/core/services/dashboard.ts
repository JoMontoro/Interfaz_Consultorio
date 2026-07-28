import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export interface CitaHoyDTO {
  idPaciente: number;
  hora: string;
  paciente: string;
  tratamiento: string;
  estado: string;
}

export interface PacienteRecienteDTO {
  id: number;
  nombre: string;
  ultimaVisita: string;
}

export interface DashboardData {
  citasCompletadas: number;
  citasPendientes: number;
  pacientesNuevos: number;
  casosActivos: number;
  facturacionMensual: number;
  citasHoy: CitaHoyDTO[];
  pacientesRecientes: PacienteRecienteDTO[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:8088/api/dashboard';

  constructor(private http: HttpClient, private auth: AuthService) {}

  obtenerDashboard() {
    return this.http.get<DashboardData>(this.apiUrl, { headers: this.auth.getAuthHeaders() });
  }
}
