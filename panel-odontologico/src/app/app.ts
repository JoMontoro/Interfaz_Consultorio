<<<<<<< HEAD
import { Component, inject } from '@angular/core';
=======
import { Component, HostBinding } from '@angular/core';
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da
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
<<<<<<< HEAD
  protected title = 'panel-odontologico';
  protected showSidebar = false;
  protected sidebarOpen = false;
  protected auth = inject(AuthService);

  constructor(private router: Router) {
    this.showSidebar = !this.router.url.startsWith('/login');
=======
  @HostBinding('class.login-route') protected loginRoute = false;

  protected showSidebar = true;
  protected sidebarCollapsed = false;
  protected dashboardDoctor = 'odontólogo';

  constructor(private router: Router, private auth: AuthService) {
    this.actualizarLayout();
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
<<<<<<< HEAD
        this.showSidebar = !this.router.url.startsWith('/login');
        this.sidebarOpen = false;
=======
        this.actualizarLayout();
>>>>>>> 9a7f877a337ee6e50b23623bc165a7628285e6da
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
