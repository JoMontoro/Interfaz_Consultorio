import { Component, HostBinding } from '@angular/core';
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
  protected dashboardDoctor = 'odontólogo';

  constructor(private router: Router, private auth: AuthService) {
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
