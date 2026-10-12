import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = 'http://localhost:8088/api/pacientes';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  /**
   * mostrarAtendidos=true (por defecto) mantiene en el listado a los pacientes con
   * presupuesto pagado / caso finalizado; false los excluye de la tabla.
   */
  listarPaginado(page: number, size: number, estado?: boolean, mostrarAtendidos = true) {
    let url = `${this.apiUrl}?page=${page}&size=${size}&mostrarAtendidos=${mostrarAtendidos}`;
    if (estado !== undefined) url += `&estado=${estado}`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
  }

  obtener(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  crear(paciente: any) {
    return this.http.post(this.apiUrl, paciente, { headers: this.getAuthHeaders() });
  }

  actualizar(id: number, paciente: any) {
    return this.http.put(`${this.apiUrl}/${id}`, paciente, { headers: this.getAuthHeaders() });
  }

  /** Oculta al paciente de la lista activa. No borra nada: la ficha se conserva. */
  desactivar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /** Vuelve a mostrar un paciente desactivado en la lista. */
  reactivar(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/reactivar`, {}, { headers: this.getAuthHeaders() });
  }

  obtenerDetalle(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalle`, { headers: this.getAuthHeaders() });
  }
}
