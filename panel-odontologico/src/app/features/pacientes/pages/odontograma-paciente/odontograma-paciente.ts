import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../../../core/services/paciente';
import { AuthService } from '../../../../core/services/auth';
import {
  OdontogramaService,
  Odontograma,
  CONDICIONES_DENTALES,
  ZONAS_TEJIDO_BLANDO,
  ESTADOS_TEJIDO_BLANDO
} from '../../../../core/services/odontograma';
import Swal from 'sweetalert2';

interface TejidoForm {
  zona: string;
  estado: string;
  observacion: string;
}

@Component({
  selector: 'app-odontograma-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './odontograma-paciente.html',
  styleUrls: ['./odontograma-paciente.css']
})
export class OdontogramaPaciente implements OnInit {

  loading = true;
  guardando = false;

  pacienteId = 0;
  paciente: any = {};

  // ===== Encabezado del registro =====
  tipoDentadura: 'ADULTO' | 'NINO' = 'ADULTO';
  editandoId: number | null = null;

  // ===== Dientes (malestares) =====
  dienteActivo: number | null = null;
  condiciones: Record<number, string[]> = {};

  // ===== Tejidos blandos y "Otros" =====
  tejidos: TejidoForm[] = [];
  observaciones = '';

  // ===== Historial =====
  historial: Odontograma[] = [];

  readonly CONDICIONES = CONDICIONES_DENTALES;
  readonly ESTADOS_TEJIDO = ESTADOS_TEJIDO_BLANDO;
  readonly ZONAS = ZONAS_TEJIDO_BLANDO;

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private odontogramaService: OdontogramaService,
    private auth: AuthService
  ) {}

  get soloLectura(): boolean {
    return this.auth.userProfile()?.rol === 'ADMIN';
  }

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.nuevo();
    if (this.pacienteId) {
      this.cargarPaciente();
      this.cargarHistorial();
    }
  }

  // ===================== DENTADURAS / ARCOS =====================

  /** Odontograma FDI: mitad izquierda de la pantalla = cuadrante del paciente derecho. */
  get arcoSuperiorIzq(): number[] {
    return this.tipoDentadura === 'ADULTO'
      ? [18, 17, 16, 15, 14, 13, 12, 11]
      : [55, 54, 53, 52, 51];
  }

  get arcoSuperiorDer(): number[] {
    return this.tipoDentadura === 'ADULTO'
      ? [21, 22, 23, 24, 25, 26, 27, 28]
      : [61, 62, 63, 64, 65];
  }

  get arcoInferiorIzq(): number[] {
    return this.tipoDentadura === 'ADULTO'
      ? [48, 47, 46, 45, 44, 43, 42, 41]
      : [85, 84, 83, 82, 81];
  }

  get arcoInferiorDer(): number[] {
    return this.tipoDentadura === 'ADULTO'
      ? [31, 32, 33, 34, 35, 36, 37, 38]
      : [71, 72, 73, 74, 75];
  }

  get etiquetaDentadura(): string {
    return this.tipoDentadura === 'ADULTO' ? 'Adulto' : 'Niño';
  }

  /**
   * Cambia entre dentición adulta e infantil. Si hay dientes marcados que no
   * existen en la nueva dentición se pide confirmación antes de quitarlos.
   */
  cambiarDentadura(tipo: 'ADULTO' | 'NINO') {
    if (tipo === this.tipoDentadura) return;

    const invalidos = Object.keys(this.condiciones)
      .map(Number)
      .filter(n => !this.validoParaTipo(n, tipo));

    if (invalidos.length > 0) {
      Swal.fire({
        title: '¿Cambiar de dentición?',
        html: `Hay ${invalidos.length} diente(s) marcado(s) que no existen en la dentición ` +
              (tipo === 'ADULTO' ? 'adulta' : 'infantil') + ' y se quitarán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      }).then(r => {
        if (!r.isConfirmed) return;
        invalidos.forEach(n => delete this.condiciones[n]);
        if (this.dienteActivo !== null && !this.validoParaTipo(this.dienteActivo, tipo)) {
          this.dienteActivo = null;
        }
        this.tipoDentadura = tipo;
      });
      return;
    }
    this.tipoDentadura = tipo;
  }

  private validoParaTipo(numero: number, tipo: 'ADULTO' | 'NINO'): boolean {
    if (tipo === 'ADULTO') {
      const cuadrante = Math.floor(numero / 10);
      const pos = numero % 10;
      return cuadrante >= 1 && cuadrante <= 4 && pos >= 1 && pos <= 8;
    }
    const cuadrante = Math.floor(numero / 10);
    const pos = numero % 10;
    return cuadrante >= 5 && cuadrante <= 8 && pos >= 1 && pos <= 5;
  }

  // ===================== DIENTES / MALESTARES =====================

  seleccionarDiente(numero: number) {
    this.dienteActivo = this.dienteActivo === numero ? null : numero;
  }

  condicionesDe(numero: number): string[] {
    return this.condiciones[numero] || [];
  }

  tieneCondicion(codigo: string): boolean {
    if (this.dienteActivo === null) return false;
    return this.condicionesDe(this.dienteActivo).includes(codigo);
  }

  /** Agrega o quita un malestar del diente activo. */
  alternarCondicion(codigo: string) {
    if (this.dienteActivo === null || this.soloLectura) return;
    const numero = this.dienteActivo;
    const actuales = [...this.condicionesDe(numero)];
    const idx = actuales.indexOf(codigo);
    if (idx >= 0) actuales.splice(idx, 1);
    else actuales.push(codigo);

    if (actuales.length === 0) delete this.condiciones[numero];
    else this.condiciones[numero] = actuales;
  }

  limpiarDiente() {
    if (this.dienteActivo === null || this.soloLectura) return;
    delete this.condiciones[this.dienteActivo];
  }

  colorDe(codigo: string): string {
    return this.CONDICIONES.find(c => c.codigo === codigo)?.color || '#94A3B8';
  }

  etiquetaDe(codigo: string): string {
    return this.CONDICIONES.find(c => c.codigo === codigo)?.label || codigo;
  }

  /** Color de borde del diente: el del primer malestar marcado. */
  colorDiente(numero: number): string {
    const lista = this.condicionesDe(numero);
    return lista.length ? this.colorDe(lista[0]) : '';
  }

  tituloDiente(numero: number): string {
    const lista = this.condicionesDe(numero);
    if (!lista.length) return `Diente ${numero} — sin malestares registrados`;
    return `Diente ${numero}: ` + lista.map(c => this.etiquetaDe(c)).join(', ');
  }

  get dientesMarcados(): number[] {
    return Object.keys(this.condiciones).map(Number).sort((a, b) => a - b);
  }

  // ===================== TEJIDOS BLANDOS =====================

  get tejidosConValor(): TejidoForm[] {
    return this.tejidos.filter(t => t.estado || (t.observacion || '').trim());
  }

  // ===================== CARGA / GUARDADO =====================

  cargarPaciente() {
    this.pacienteService.obtener(this.pacienteId).subscribe({
      next: (data: any) => {
        this.paciente = data || {};
        this.loading = false;
        // La dentición sugerida sale de la edad del paciente.
        if (this.editandoId === null && !this.condicionesMarcadas()) {
          this.tipoDentadura = this.edadPaciente() < 13 ? 'NINO' : 'ADULTO';
        }
      },
      error: () => {
        this.paciente = {};
        this.loading = false;
      }
    });
  }

  private condicionesMarcadas(): boolean {
    return Object.keys(this.condiciones).length > 0;
  }

  private edadPaciente(): number {
    if (!this.paciente.fechaNacimiento) return 99;
    const nacimiento = new Date(this.paciente.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  cargarHistorial() {
    this.odontogramaService.listarPorPaciente(this.pacienteId).subscribe({
      next: (data) => this.historial = data || [],
      error: () => this.historial = []
    });
  }

  /** Limpia el formulario para registrar una evaluación nueva. */
  nuevo() {
    this.editandoId = null;
    this.dienteActivo = null;
    this.condiciones = {};
    this.observaciones = '';
    this.tejidos = this.ZONAS.map(z => ({ zona: z, estado: '', observacion: '' }));
    if (this.paciente.fechaNacimiento) {
      this.tipoDentadura = this.edadPaciente() < 13 ? 'NINO' : 'ADULTO';
    }
  }

  /** Carga una evaluación del historial para editarla. */
  cargar(od: Odontograma) {
    this.editandoId = od.id;
    this.tipoDentadura = (od.tipoDentadura as 'ADULTO' | 'NINO') || 'ADULTO';
    this.observaciones = od.observaciones || '';
    this.dienteActivo = null;

    this.condiciones = {};
    (od.dientes || []).forEach(d => {
      if (d.condiciones && d.condiciones.length) {
        this.condiciones[d.numeroDiente] = [...d.condiciones];
      }
    });

    this.tejidos = this.ZONAS.map(z => {
      const guardado = (od.tejidosBlandos || []).find(t => t.zona === z);
      return {
        zona: z,
        estado: guardado?.estado || '',
        observacion: guardado?.observacion || ''
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(od: Odontograma) {
    Swal.fire({
      title: '¿Eliminar odontograma?',
      text: `La evaluación del ${this.fechaCorta(od.fechaRegistro)} se eliminará de la base de datos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.odontogramaService.eliminar(od.id).subscribe({
        next: () => {
          if (this.editandoId === od.id) this.nuevo();
          this.cargarHistorial();
          Swal.fire('Eliminado', 'El odontograma fue eliminado', 'success');
        },
        error: (err: any) => Swal.fire('No se pudo eliminar', this.msgError(err), 'error')
      });
    });
  }

  guardar() {
    if (this.soloLectura) return;

    const dientes = this.dientesMarcados.map(n => ({
      numeroDiente: n,
      condiciones: this.condicionesDe(n)
    }));
    const tejidos = this.tejidosConValor.map(t => ({
      zona: t.zona,
      estado: t.estado,
      observacion: (t.observacion || '').trim()
    }));

    if (dientes.length === 0 && tejidos.length === 0 && !this.observaciones.trim()) {
      Swal.fire('Sin datos', 'Marque los malestares de los dientes, valore los tejidos blandos o escriba la evaluación antes de guardar', 'warning');
      return;
    }

    const cuerpo = {
      pacienteId: this.pacienteId,
      tipoDentadura: this.tipoDentadura,
      observaciones: this.observaciones.trim(),
      dientes,
      tejidosBlandos: tejidos
    };

    this.guardando = true;
    const esEdicion = this.editandoId !== null;
    const peticion = esEdicion
      ? this.odontogramaService.actualizar(this.editandoId!, cuerpo)
      : this.odontogramaService.crear(cuerpo);

    peticion.subscribe({
      next: (guardado: Odontograma) => {
        this.guardando = false;
        this.editandoId = guardado.id;
        this.cargarHistorial();
        Swal.fire(
          esEdicion ? 'Odontograma actualizado' : 'Odontograma registrado',
          `Dentición ${this.etiquetaDentadura.toLowerCase()}, ${dientes.length} diente(s) con malestares y ${tejidos.length} zona(s) de tejido blando`,
          'success'
        );
      },
      error: (err: any) => {
        this.guardando = false;
        Swal.fire('No se pudo guardar', this.msgError(err), 'error');
      }
    });
  }

  // ===================== VARIOS =====================

  fechaCorta(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  horaCorta(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  iniciales(): string {
    const nombre = (this.paciente.nombre || '?')[0] || '?';
    const apellido = (this.paciente.apellido || '')[0] || '';
    return nombre + apellido;
  }

  private msgError(err: any, porDefecto = 'Ocurrió un error inesperado'): string {
    return err?.error?.mensaje || err?.error?.message || err?.message || porDefecto;
  }
}
