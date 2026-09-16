import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  private apiUrl = 'http://localhost:8088/api/presupuestos';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  obtenerPorCaso(casoId: number) {
    return this.http.get<any>(`${this.apiUrl}/caso/${casoId}`, {
      headers: this.getAuthHeaders()
    });
  }

  generar(casoId: number, descuento: number = 0) {
    return this.http.post<any>(`${this.apiUrl}/caso/${casoId}`, { descuento }, {
      headers: this.getAuthHeaders()
    });
  }

  aprobar(presupuestoId: number) {
    return this.http.put<any>(`${this.apiUrl}/${presupuestoId}/aprobar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  registrarPago(presupuestoId: number, monto: number) {
    return this.http.post<any>(`${this.apiUrl}/${presupuestoId}/pagos`, { monto }, {
      headers: this.getAuthHeaders()
    });
  }
}