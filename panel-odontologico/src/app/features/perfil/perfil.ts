import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent {

  protected auth = inject(AuthService);

  nombre = this.auth.userProfile()?.nombre || '';
  apellido = this.auth.userProfile()?.apellido || '';
  guardando = false;
  subiendo = false;
  mensaje = '';
  exito = false;
  preview = '';

  ngOnInit() {
    this.nombre = this.auth.userProfile()?.nombre || '';
    this.apellido = this.auth.userProfile()?.apellido || '';
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.preview = URL.createObjectURL(file);
    this.subiendo = true;

    this.auth.subirFoto(file).subscribe({
      next: () => {
        this.subiendo = false;
        this.mostrarMensaje('Foto actualizada correctamente', true);
      },
      error: () => {
        this.subiendo = false;
        this.mostrarMensaje('Error al subir la foto', false);
      }
    });
  }

  guardar() {
    this.guardando = true;
    this.mensaje = '';

    this.auth.actualizarPerfil({ nombre: this.nombre, apellido: this.apellido }).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarMensaje('Perfil actualizado correctamente', true);
      },
      error: () => {
        this.guardando = false;
        this.mostrarMensaje('Error al guardar los cambios', false);
      }
    });
  }

  private mostrarMensaje(msg: string, exito: boolean) {
    this.mensaje = msg;
    this.exito = exito;
    setTimeout(() => this.mensaje = '', 3000);
  }
}
