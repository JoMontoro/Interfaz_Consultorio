import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl =
    'http://localhost:8088/api/dashboard';

  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    Authorization:
      'Basic ' + btoa('odontologo:123456')
  });

  obtenerDashboard() {

    return this.http.get<any>(
      this.apiUrl,
      { headers: this.headers }
    );

  }

}