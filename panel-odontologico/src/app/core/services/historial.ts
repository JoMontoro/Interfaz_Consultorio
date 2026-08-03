import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  private apiUrl = 'http://localhost:8088/api/historial';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  obtenerPorPaciente(pacienteId: number) {
    return this.http.get<any>(`${this.apiUrl}/paciente/${pacienteId}`, { headers: this.getAuthHeaders() });
  }

  crear(historial: any) {
    return this.http.post<any>(this.apiUrl, historial, { headers: this.getAuthHeaders() });
  }

  actualizar(id: number, historial: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, historial, { headers: this.getAuthHeaders() });
  }
}