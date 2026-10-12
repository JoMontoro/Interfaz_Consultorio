import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth';
import { Tratamiento, TratamientoService } from '../../../../core/services/tratamiento';

@Component({
  selector: 'app-listar-tratamientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-tratamientos.html',
  styleUrls: ['./listar-tratamientos.css'],
})
export class ListarTratamientosComponent implements OnInit {

  private auth = inject(AuthService);

  Lista: Tratamiento[] = [];
  categorias: string[] = [];

  termino = '';
  filtroCategoria = '';
  incluirInactivos = true;

  showModal = false;
  modoEdicion = false;
  editandoId: number | null = null;
  guardando = false;

  form: Partial<Tratamiento> = {};

  /** El ADMIN supervisa: consulta el catalogo pero no lo modifica. */
  readonly soloLectura = computed(() => this.auth.userProfile()?.rol === 'ADMIN');

  readonly tituloModal = computed(() => (this.modoEdicion ? 'Editar Tratamiento' : 'Nuevo Tratamiento'));

  constructor(private service: TratamientoService) {}

  ngOnInit(): void {
    this.cargar();
    this.cargarCategorias();
  }

  cargar() {
    this.service.listarTodos(this.incluirInactivos).subscribe({
      next: (data) => (this.Lista = data || []),
      error: (err) => {
        console.error(err);
        Swal.fire('Error', this.mensaje(err, 'No se pudo cargar el catalogo de tratamientos'), 'error');
      }
    });
  }

  cargarCategorias() {
    this.service.listarCategorias().subscribe({
      next: (data) => (this.categorias = data || []),
      error: () => (this.categorias = [])
    });
  }

  get tratamientosFiltrados(): Tratamiento[] {
    const texto = this.termino.trim().toLowerCase();
    return this.Lista.filter(t => {
      const coincideCategoria = !this.filtroCategoria || (t.categoria || '') === this.filtroCategoria;
      const coincideTexto =
        !texto ||
        (t.nombre || '').toLowerCase().includes(texto) ||
        (t.codigo || '').toLowerCase().includes(texto) ||
        (t.descripcion || '').toLowerCase().includes(texto);
      return coincideCategoria && coincideTexto;
    });
  }

  get totalActivos(): number {
    return this.Lista.filter(t => t.activo).length;
  }

  get totalInactivos(): number {
    return this.Lista.length - this.totalActivos;
  }

  abrirModal() {
    this.modoEdicion = false;
    this.editandoId = null;
    this.form = { activo: true, duracionMinutos: 30 };
    this.showModal = true;
  }

  abrirEdicion(tratamiento: Tratamiento) {
    this.modoEdicion = true;
    this.editandoId = tratamiento.id ?? null;
    this.form = { ...tratamiento };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.form = {};
    this.editandoId = null;
  }

  guardar() {
    if (!this.form.nombre || !this.form.nombre.trim()) {
      Swal.fire('Faltan datos', 'El nombre del tratamiento es obligatorio.', 'warning');
      return;
    }
    if (this.form.duracionMinutos !== null && this.form.duracionMinutos !== undefined
        && Number(this.form.duracionMinutos) <= 0) {
      Swal.fire('Faltan datos', 'La duracion debe ser mayor a 0 minutos.', 'warning');
      return;
    }
    if (this.form.precioReferencia !== null && this.form.precioReferencia !== undefined
        && Number(this.form.precioReferencia) < 0) {
      Swal.fire('Faltan datos', 'El precio de referencia no puede ser negativo.', 'warning');
      return;
    }

    const payload: Tratamiento = {
      nombre: (this.form.nombre ?? '').trim(),
      codigo: (this.form.codigo ?? '').trim() || null,
      descripcion: (this.form.descripcion ?? '').trim() || null,
      categoria: (this.form.categoria ?? '').trim() || null,
      duracionMinutos: this.form.duracionMinutos === null || this.form.duracionMinutos === undefined
        ? null
        : Number(this.form.duracionMinutos),
      precioReferencia: this.form.precioReferencia === null || this.form.precioReferencia === undefined
        ? null
        : Number(this.form.precioReferencia),
      activo: this.modoEdicion ? this.form.activo : true
    };

    this.guardando = true;
    const peticion = this.modoEdicion && this.editandoId !== null
      ? this.service.actualizar(this.editandoId, payload)
      : this.service.crear(payload);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire(
          this.modoEdicion ? 'Actualizado' : 'Registrado',
          this.modoEdicion
            ? 'El tratamiento se actualizo correctamente.'
            : 'El tratamiento se registro en el catalogo.',
          'success'
        );
        this.cerrarModal();
        this.cargar();
        this.cargarCategorias();
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        Swal.fire('No se pudo guardar', this.mensaje(err, 'Revisa los datos e intentalo otra vez.'), 'error');
      }
    });
  }

  /** Baja logica: el tratamiento deja de ofrecerse pero se conserva el historial. */
  cambiarEstado(tratamiento: Tratamiento) {
    const activar = !tratamiento.activo;
    Swal.fire({
      title: activar ? '¿Activar tratamiento?' : '¿Desactivar tratamiento?',
      text: activar
        ? `"${tratamiento.nombre}" volvera a estar disponible al crear citas y planes.`
        : `"${tratamiento.nombre}" dejara de ofrecerse, pero se conservara en el historial clinico.`,
      icon: activar ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: activar ? '#10B981' : '#EF4444',
      confirmButtonText: activar ? 'Si, activar' : 'Si, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service.cambiarEstado(tratamiento.id!, activar).subscribe({
        next: () => {
          Swal.fire(
            activar ? 'Activado' : 'Desactivado',
            activar ? 'El tratamiento vuelve a estar disponible.' : 'El tratamiento ya no se ofrece.',
            'success'
          );
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('No se pudo cambiar el estado', this.mensaje(err), 'error');
        }
      });
    });
  }

  /** Eliminacion definitiva: solo posible si ningun plan ni cita lo referencia. */
  eliminar(tratamiento: Tratamiento) {
    Swal.fire({
      title: '¿Eliminar de la base de datos?',
      html: `Se eliminara <strong>${tratamiento.nombre}</strong> de forma permanente.<br>
             Si ya se uso en alguna cita o plan, el sistema lo impedira y te permitira desactivarlo en su lugar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service.eliminar(tratamiento.id!).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El tratamiento se elimino de la base de datos.', 'success');
          this.cargar();
          this.cargarCategorias();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('No se pudo eliminar', this.mensaje(err, 'El tratamiento esta en uso.'), 'warning');
        }
      });
    });
  }

  precio(valor?: number | null): string {
    if (valor === null || valor === undefined) return '—';
    return `S/ ${Number(valor).toFixed(2)}`;
  }

  duracion(minutos?: number | null): string {
    if (!minutos) return '—';
    if (minutos < 60) return `${minutos} min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  /** Extrae el mensaje real del backend para no mostrar errores genericos. */
  private mensaje(err: any, porDefecto = 'Ocurrio un error inesperado.'): string {
    const candidatos = [err?.error?.mensaje, err?.error?.message, err?.error, err?.message];
    for (const c of candidatos) {
      if (typeof c === 'string' && c.trim()) return c;
    }
    return porDefecto;
  }
}
