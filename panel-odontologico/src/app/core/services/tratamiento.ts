import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export interface Tratamiento {
  id?: number;
  codigo?: string | null;
  nombre: string;
  descripcion?: string | null;
  duracionMinutos?: number | null;
  precioReferencia?: number | null;
  categoria?: string | null;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private apiUrl = 'http://localhost:8088/api/tratamientos';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private headers() {
    return this.auth.getAuthHeaders();
  }

  /** Solo los treatments activos: alimenta los selectores de citas y planes. */
  listarActivos() {
    return this.http.get<Tratamiento[]>(this.apiUrl, { headers: this.headers() });
  }

  /** Catalogo completo para la pantalla de administracion. */
  listarTodos(incluirInactivos = true) {
    return this.http.get<Tratamiento[]>(`${this.apiUrl}/todos?incluirInactivos=${incluirInactivos}`, {
      headers: this.headers()
    });
  }

  listarCategorias() {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`, { headers: this.headers() });
  }

  obtener(id: number) {
    return this.http.get<Tratamiento>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  crear(tratamiento: Tratamiento) {
    return this.http.post<Tratamiento>(this.apiUrl, tratamiento, { headers: this.headers() });
  }

  actualizar(id: number, tratamiento: Tratamiento) {
    return this.http.put<Tratamiento>(`${this.apiUrl}/${id}`, tratamiento, { headers: this.headers() });
  }

  /** Baja logica: deja de ofrecerse pero conserva el historial clinico. */
  cambiarEstado(id: number, activo: boolean) {
    return this.http.put<Tratamiento>(`${this.apiUrl}/${id}/estado`, { activo } as Tratamiento, {
      headers: this.headers()
    });
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
