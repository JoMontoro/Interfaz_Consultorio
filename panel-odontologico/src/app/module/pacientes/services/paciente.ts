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

  listar() {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  crear(paciente: any) {
    return this.http.post(this.apiUrl, paciente, {
      headers: this.getAuthHeaders()
    });
  }
}