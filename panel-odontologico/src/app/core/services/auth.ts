import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'http://localhost:8088/api';
  private authHeader: HttpHeaders | null = null;

  constructor(private http: HttpClient) {
    const savedHeader = localStorage.getItem('authHeader');
    if (savedHeader) {
      this.authHeader = new HttpHeaders({ Authorization: savedHeader });
    }
  }

  private buildAuthHeader(username: string, password: string) {
    return new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password)
    });
  }

  login(username: string, password: string) {
    const headers = this.buildAuthHeader(username, password);
    this.authHeader = headers;
    localStorage.setItem('authHeader', headers.get('Authorization') ?? '');
    return this.http.get(`${this.url}/pacientes`, { headers });
  }

  getAuthHeaders() {
    return this.authHeader ?? new HttpHeaders();
  }
}