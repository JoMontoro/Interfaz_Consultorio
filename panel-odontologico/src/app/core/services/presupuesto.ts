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

  /** Aplica un descuento: el total a cobrar baja en la misma medida. */
  actualizarDescuento(presupuestoId: number, descuento: number) {
    return this.http.put<any>(`${this.apiUrl}/${presupuestoId}/descuento`, { descuento }, {
      headers: this.getAuthHeaders()
    });
  }

  /** Fija el monto total a cobrar al paciente, editando el presupuesto. */
  actualizarMonto(presupuestoId: number, monto: number) {
    return this.http.put<any>(`${this.apiUrl}/${presupuestoId}/monto`, { monto }, {
      headers: this.getAuthHeaders()
    });
  }

  /** Vuelve al total calculado a partir de los precios del plan. */
  quitarMontoPersonalizado(presupuestoId: number) {
    return this.http.delete<any>(`${this.apiUrl}/${presupuestoId}/monto`, {
      headers: this.getAuthHeaders()
    });
  }

  registrarPago(presupuestoId: number, monto: number) {
    return this.http.post<any>(`${this.apiUrl}/${presupuestoId}/pagos`, { monto }, {
      headers: this.getAuthHeaders()
    });
  }
}