import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private apiUrl = 'http://localhost:8088/api/citas';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  listar(page: number, size: number, q?: string, estado?: string) {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (q && q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;
    if (estado) url += `&estado=${estado}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  obtener(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  crear(cita: any) {
    return this.http.post<any>(this.apiUrl, cita, { headers: this.getAuthHeaders() });
  }

  actualizar(id: number, cita: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, cita, { headers: this.getAuthHeaders() });
  }

  cancelar(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.getAuthHeaders() });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  listarOdontologos() {
    return this.http.get<any[]>('http://localhost:8088/api/usuarios/odontologos', { headers: this.getAuthHeaders() });
  }

  listarCasos(pacienteId: number) {
    return this.http.get<any[]>(`http://localhost:8088/api/pacientes/${pacienteId}/casos`, { headers: this.getAuthHeaders() });
  }

  listarTratamientos() {
    return this.http.get<any[]>('http://localhost:8088/api/tratamientos', { headers: this.getAuthHeaders() });
  }
}