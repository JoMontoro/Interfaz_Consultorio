import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = 'http://localhost:8088/api/pacientes';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return new HttpHeaders({
      Authorization: 'Basic ' + btoa('odontologo:123456')
    });
  }

listarPaginado(
  page: number,
  size: number
) {
    return this.http.get<any[]>(
     `${this.apiUrl}?page=${page}&size=${size}`,
     {
        headers: this.getAuthHeaders()
     }
    );
  }

  // OBTENER POR ID
  obtener(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // CREAR
  crear(paciente: any) {
    return this.http.post(
      this.apiUrl,
      paciente,
      { headers: this.getAuthHeaders() }
    );
  }

  // ACTUALIZAR
  actualizar(id: number, paciente: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      paciente,
      { headers: this.getAuthHeaders() }
    );
  }

  // ELIMINAR
  eliminar(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
obtenerDetalle(id: number) {

  return this.http.get<any>(
    `${this.apiUrl}/${id}/detalle`,
    { headers: this.getAuthHeaders() }
  );

}

}