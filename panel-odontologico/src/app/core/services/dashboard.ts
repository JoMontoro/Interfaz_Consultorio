import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8088/api/dashboard';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  obtenerDashboard() {
    return this.http.get<any>(this.apiUrl, { headers: this.auth.getAuthHeaders() });
  }
}
