<<<<<<< HEAD
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
=======
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CitaHoy {
  hora: string;
  paciente: string;
  id_paciente: number;
  tratamiento: string;
  estado: string;
}
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da

export interface PacienteReciente {
  id?: number;
  id_paciente?: number;
  nombre: string;
  ultimaVisita: string;
}

export interface AlertaInventario {
  producto: string;
  stock: string;
  tipo: 'bajo' | 'critico';
}

export interface IDashboard {
  doctorNombre: string;
  citasCompletadas: number;
  pacientesNuevos: number;
  facturacionMensual: number;
  variacionCitas: number;
  variacionPacientes: number;
  variacionFacturacion: number;
  citasHoy: CitaHoy[];
  pacientesRecientes: PacienteReciente[];
  alertasInventario: AlertaInventario[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
<<<<<<< HEAD

  private apiUrl = 'http://localhost:8088/api/dashboard';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  obtenerDashboard() {
    return this.http.get<any>(this.apiUrl, { headers: this.auth.getAuthHeaders() });
  }
=======
  private apiUrl = 'http://localhost:8088/api/dashboard';
  private headers = new HttpHeaders({
    Authorization: 'Basic ' + btoa('odontologo:123456')
  });

  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<IDashboard> {
    return this.http.get<any>(this.apiUrl, { headers: this.headers }).pipe(
      map((res) => this.normalizar(res))
    );
  }

  private normalizar(raw: any): IDashboard {
    return {
      doctorNombre: raw.doctorNombre || raw.doctor_nombre || '',
      citasCompletadas: raw.citasCompletadas ?? raw.citas_completadas ?? 0,
      pacientesNuevos: raw.pacientesNuevos ?? raw.pacientes_nuevos ?? 0,
      facturacionMensual: raw.facturacionMensual ?? raw.facturacion_mensual ?? 0,
      variacionCitas: raw.variacionCitas ?? raw.variacion_citas ?? 0,
      variacionPacientes: raw.variacionPacientes ?? raw.variacion_pacientes ?? 0,
      variacionFacturacion: raw.variacionFacturacion ?? raw.variacion_facturacion ?? 0,
      citasHoy: Array.isArray(raw.citasHoy ?? raw.citas_hoy) ? (raw.citasHoy ?? raw.citas_hoy) : [],
      pacientesRecientes: Array.isArray(raw.pacientesRecientes ?? raw.pacientes_recientes ?? raw.recientes) 
        ? (raw.pacientesRecientes ?? raw.pacientes_recientes ?? raw.recientes) : [],
      alertasInventario: Array.isArray(raw.alertasInventario ?? raw.alertas_inventario ?? raw.alertas)
        ? (raw.alertasInventario ?? raw.alertas_inventario ?? raw.alertas) : []
    };
  }
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da
}
