import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface UserProfile {
  username: string;
  nombre: string;
  apellido: string;
  correo?: string;
  especialidad?: string;
  foto?: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'http://localhost:8088/api';
  private readonly AUTH_KEY = 'auth_token';
  private readonly PROFILE_KEY = 'user_profile';

  userProfile = signal<UserProfile | null>(null);
  fotoUrl = computed(() => {
    const foto = this.userProfile()?.foto;
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return 'http://localhost:8088' + foto;
  });

  constructor(private http: HttpClient) {
    this.cargarPerfilGuardado();
  }

  private cargarPerfilGuardado() {
    const stored = sessionStorage.getItem(this.PROFILE_KEY);
    if (stored) {
      this.userProfile.set(JSON.parse(stored));
    }
  }

  login(username: string, password: string) {
    const token = btoa(username + ':' + password);
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token
    });

    return this.http.get<UserProfile>(`${this.url}/auth/me`, { headers }).pipe(
      tap((perfil) => {
        sessionStorage.setItem(this.AUTH_KEY, token);
        sessionStorage.setItem(this.PROFILE_KEY, JSON.stringify(perfil));
        this.userProfile.set({ ...perfil });
      })
    );
  }

  logout() {
    sessionStorage.removeItem(this.AUTH_KEY);
    sessionStorage.removeItem(this.PROFILE_KEY);
    this.userProfile.set(null);
  }

  estaAutenticado(): boolean {
    return !!sessionStorage.getItem(this.AUTH_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(this.AUTH_KEY);
    return new HttpHeaders({
      Authorization: 'Basic ' + token
    });
  }

  actualizarPerfil(data: Partial<UserProfile>) {
    return this.http.put<UserProfile>(`${this.url}/auth/me`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((perfil) => {
        sessionStorage.setItem(this.PROFILE_KEY, JSON.stringify(perfil));
        this.userProfile.set({ ...perfil });
      })
    );
  }

  subirFoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ foto: string }>(`${this.url}/auth/foto`, formData, {
      headers: this.getAuthHeaders().delete('Content-Type')
    }).pipe(
      tap((res) => {
        const perfil = this.userProfile();
        if (perfil) {
          const actualizado = { ...perfil, foto: res.foto };
          sessionStorage.setItem(this.PROFILE_KEY, JSON.stringify(actualizado));
          this.userProfile.set(actualizado);
        }
      })
    );
  }
}
