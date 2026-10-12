import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CasoClinicoService {

  private apiUrl = 'http://localhost:8088/api';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  listarPorPaciente(pacienteId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes/${pacienteId}/casos`, {
      headers: this.getAuthHeaders()
    });
  }

  obtener(id: number) {
    return this.http.get<any>(`${this.apiUrl}/casos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crear(pacienteId: number, data: { motivoConsulta?: string; diagnostico?: string }) {
    return this.http.post<any>(`${this.apiUrl}/pacientes/${pacienteId}/casos`, data, {
      headers: this.getAuthHeaders()
    });
  }

  actualizar(id: number, data: { motivoConsulta?: string; estado?: string; diagnostico?: string }) {
    return this.http.put<any>(`${this.apiUrl}/casos/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  cancelar(id: number) {
    return this.http.delete(`${this.apiUrl}/casos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
