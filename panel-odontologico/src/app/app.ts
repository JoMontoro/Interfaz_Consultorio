import { Component, HostBinding, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  @HostBinding('class.login-route') protected loginRoute = false;

  protected showSidebar = true;
  protected sidebarCollapsed = false;
  protected sidebarOpen = false;
  protected auth: AuthService;

  protected titulo = computed(() => {
    const nombre = this.auth.userProfile()?.nombre || '';
    return nombre.toLowerCase().endsWith('a') ? 'Dra.' : 'Dr.';
  });

  protected rolGenero = computed(() => {
    const nombre = this.auth.userProfile()?.nombre || '';
    const esFemenino = nombre.toLowerCase().endsWith('a');
    const rol = this.auth.userProfile()?.rol?.toLowerCase() || '';
    if (rol === 'odontologo' || rol === 'odontólogo') {
      return esFemenino ? 'Odontóloga' : 'Odontólogo';
    }
    // para otros roles podrías agregar más casos
    return this.auth.userProfile()?.rol || '';
  });

  constructor(private router: Router, auth: AuthService) {
    this.auth = auth;
    this.actualizarLayout();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarLayout();
      });
  }

  private actualizarLayout() {
    const esLogin = this.router.url.startsWith('/login');
    const esCrearPaciente = this.router.url.startsWith('/pacientes/crear');
    this.showSidebar = !esLogin && !esCrearPaciente;
    this.loginRoute = esLogin;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
