import { Component, inject } from '@angular/core';
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
  protected showSidebar = false;
  protected sidebarOpen = false;
  protected auth = inject(AuthService);

  constructor(private router: Router) {
    this.showSidebar = !this.router.url.startsWith('/login');

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showSidebar = !this.router.url.startsWith('/login');
        this.sidebarOpen = false;
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
