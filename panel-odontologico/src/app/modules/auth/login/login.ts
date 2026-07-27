import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.errorMsg = 'Ingrese usuario y contraseña';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/panel-principal']);
      },
      error: () => {
        this.errorMsg = 'Credenciales incorrectas. Verifique e intente nuevamente.';
        this.loading = false;
      }
    });
  }
}
