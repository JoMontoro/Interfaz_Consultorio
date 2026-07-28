import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  private router = inject(Router);
  private authService = inject(AuthService);

  login(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/panel-principal']);
      },
      error: (err) => {
        console.error('Error de autenticación:', err);
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}
