import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export interface PlanTratamiento {
  id?: number;
  nombre: string;
  sesionesEstimadas?: number | null;
  costoEstimado?: number | null;
  estado?: string;
  casoClinico?: any;
}

export interface PlanDetalle {
  id?: number;
  procedimiento?: string;
  orden?: number;
  precio?: number | null;
  estado?: string;
  diente?: number | null;
  cara?: string | null;
  /** El endpoint de alta recibe el id del tratamiento del catalogo a cotizar. */
  tratamientoId?: number;
  tratamiento?: { id: number; nombre: string; precioReferencia?: number | null };
  plan?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PlanTratamientoService {

  private apiUrl = 'http://localhost:8088/api/planes-tratamiento';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private headers() {
    return this.auth.getAuthHeaders();
  }

  listarPorCaso(casoId: number) {
    return this.http.get<PlanTratamiento[]>(`${this.apiUrl}/caso/${casoId}`, { headers: this.headers() });
  }

  crear(casoId: number, plan: Partial<PlanTratamiento>) {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/caso/${casoId}`, plan, { headers: this.headers() });
  }

  /**
   * Genera el plan automaticamente a partir del diagnostico y del motivo de
   * consulta del caso. Con forzar=true reemplaza los tratamientos sugeridos que
   * aun esten pendientes.
   */
  generarDesdeDiagnostico(casoId: number, forzar = false) {
    return this.http.post<PlanTratamiento>(
      `${this.apiUrl}/caso/${casoId}/automatico?forzar=${forzar}`,
      {},
      { headers: this.headers() }
    );
  }

  /** Arma el plan con los tratamientos que eligio el odontologo, en un solo paso. */
  generarDesdeTratamientos(casoId: number, body: {
    nombre?: string;
    sesionesEstimadas?: number;
    tratamientos: { tratamientoId: number; orden?: number; diente?: number | null; cara?: string | null; precio?: number | null }[];
  }) {
    return this.http.post<PlanTratamiento>(`${this.apiUrl}/caso/${casoId}/generar`, body, {
      headers: this.headers()
    });
  }

  actualizarEstado(planId: number, estado: string) {
    return this.http.put<PlanTratamiento>(`${this.apiUrl}/${planId}/estado`, { estado }, { headers: this.headers() });
  }

  listarDetalles(planId: number) {
    return this.http.get<PlanDetalle[]>(`${this.apiUrl}/${planId}/detalles`, { headers: this.headers() });
  }

  agregarDetalle(planId: number, detalle: Partial<PlanDetalle>) {
    return this.http.post<PlanDetalle>(`${this.apiUrl}/${planId}/detalles`, detalle, { headers: this.headers() });
  }

  /** Permite corregir el precio a cobrar de un tratamiento del plan. */
  actualizarDetalle(planId: number, detalleId: number, cambios: Partial<PlanDetalle>) {
    return this.http.put<PlanDetalle>(`${this.apiUrl}/${planId}/detalles/${detalleId}`, cambios, {
      headers: this.headers()
    });
  }

  actualizarEstadoDetalle(planId: number, detalleId: number, estado: string) {
    return this.http.put<PlanDetalle>(
      `${this.apiUrl}/${planId}/detalles/${detalleId}/estado`,
      { estado },
      { headers: this.headers() }
    );
  }

  eliminarDetalle(planId: number, detalleId: number) {
    return this.http.delete<void>(`${this.apiUrl}/${planId}/detalles/${detalleId}`, { headers: this.headers() });
  }
}
