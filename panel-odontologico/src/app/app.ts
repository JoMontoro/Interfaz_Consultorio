import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'panel-odontologico';
  protected showSidebar = true;

  constructor(private router: Router, private auth: AuthService) {
    this.showSidebar = !this.router.url.startsWith('/login') && !this.router.url.startsWith('/pacientes/crear');

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showSidebar = !this.router.url.startsWith('/login') && !this.router.url.startsWith('/pacientes/crear');
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
