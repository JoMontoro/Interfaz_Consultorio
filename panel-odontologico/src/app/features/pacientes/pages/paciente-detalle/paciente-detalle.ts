import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../../../core/services/paciente';
import { CasoClinicoService } from '../../../../core/services/caso-clinico';
import { HistorialService } from '../../../../core/services/historial';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paciente-detalle.html',
  styleUrls: ['./paciente-detalle.css']
})
export class DetallePaciente implements OnInit {

  loading = true;

  paciente: any = {};
  historial: any = {};
  casos: any[] = [];
  pago: any = {};

  // Odontograma (notación FDI)
  arcoSuperiorIzq = [18, 17, 16, 15, 14, 13, 12, 11];
  arcoSuperiorDer = [21, 22, 23, 24, 25, 26, 27, 28];
  arcoInferiorIzq = [48, 47, 46, 45, 44, 43, 42, 41];
  arcoInferiorDer = [31, 32, 33, 34, 35, 36, 37, 38];

  // Tejidos blandos (editable en pantalla)
  tejidosBlandos = [
    { label: 'Labios', valor: '' },
    { label: 'Carrillos / Mejillas', valor: '' },
    { label: 'Mucosa Oral', valor: '' },
    { label: 'Encías', valor: '' },
    { label: 'Paladar', valor: '' },
    { label: 'Lengua', valor: '' },
    { label: 'Piso de Boca', valor: '' },
    { label: 'Ganglios Linfáticos', valor: '' }
  ];

  // Formularios editables
  motivoForm = '';
  histForm = { antecedentesMedicos: '', alergias: '', enfermedades: '', observacionesGenerales: '' };

  // Odontograma editable (visual, sin persistencia en backend)
  odontoEstado: Record<number, string> = {};
  ordenOdonto = ['sano', 'caries', 'obturado', 'extraido'];
  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private casoClinicoService: CasoClinicoService,
    private historialService: HistorialService
  ) {}

  // Modales
  showEditModal = false;
  editForm: any = {};

  showConsentimiento = false;
  consentimientoAceptado = false;
  consentimientoTexto =
    'Yo, paciente / representante legal, declaro haber sido informado(a) sobre el ' +
    'diagnóstico, el plan de tratamiento odontológico, sus beneficios, riesgos, ' +
    'alternativas y costos. Autorizo al profesional a realizar los procedimientos ' +
    'necesarios para mi atención y acepto las indicaciones post-tratamiento.';

  showFirmar = false;
  firmaCapturada = false;
  private firmando = false;
  @ViewChild('canvasFirma') canvasRef?: ElementRef<HTMLCanvasElement>;

  showPago = false;
  montoPago = 0;

  abrirPago() {
    this.montoPago = 0;
    this.showPago = true;
  }

  cerrarPago() {
    this.showPago = false;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarPaciente(id);
      this.cargarCasos(id);
    }
  }

  get motivoConsulta(): string {
    const activo = this.casos.find(c => c.estado !== 'CANCELADO') || this.casos[0];
    return activo ? activo.motivoConsulta : '';
  }

  get casoActivo(): any {
    return this.casos.find(c => c.estado !== 'CANCELADO' && c.estado !== 'FINALIZADO') || this.casos[0] || null;
  }

  cargarPaciente(id: number) {
    this.loading = true;
    this.pacienteService.obtenerDetalle(id).subscribe({
      next: (data: any) => {
        this.paciente = data.paciente || {};
        this.historial = data.historial || {};
        this.histForm = {
          antecedentesMedicos: this.historial.antecedentesMedicos || '',
          alergias: this.historial.alergias || '',
          enfermedades: this.historial.enfermedades || '',
          observacionesGenerales: this.historial.observacionesGenerales || ''
        };
        const presupuesto = data.presupuesto || {};
        this.pago = {
          total: presupuesto.total || null,
          adelanto: presupuesto.adelanto || null,
          restante: presupuesto.restante || null
        };
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  cargarCasos(id: number) {
    this.casoClinicoService.listarPorPaciente(id).subscribe({
      next: (data) => {
        this.casos = data;
        this.motivoForm = this.motivoConsulta;
        if (!this.pago.restante && this.casoActivo && this.casoActivo.saldoPendiente) {
          this.pago.restante = this.casoActivo.saldoPendiente;
        }
      },
      error: () => this.casos = []
    });
  }

  abrirEditModal() {
    this.editForm = { ...this.paciente };
    this.showEditModal = true;
  }

  cerrarEditModal() {
    this.showEditModal = false;
  }

  guardarEdicion() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pacienteService.actualizar(id, this.editForm).subscribe({
      next: () => {
        this.showEditModal = false;
        Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
        this.cargarPaciente(id);
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar el paciente', 'error')
    });
  }

  abrirConsentimiento() {
    this.consentimientoAceptado = false;
    this.showConsentimiento = true;
  }

  cerrarConsentimiento() {
    this.showConsentimiento = false;
  }

  aceptarConsentimiento() {
    this.consentimientoAceptado = true;
    this.showConsentimiento = false;
    Swal.fire('Registrado', 'Consentimiento informado registrado', 'success');
  }

  guardarMotivo() {
    if (!this.motivoForm.trim()) {
      Swal.fire('Aviso', 'El motivo de consulta no puede estar vacío', 'warning');
      return;
    }
    const idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    const caso = this.casoActivo;
    // Si ya existe un caso, se actualiza el motivo; si no, se crea el caso con el nuevo motivo
    if (caso) {
      this.casoClinicoService.actualizar(caso.id, { motivoConsulta: this.motivoForm }).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Motivo de consulta actualizado', 'success');
          this.cargarCasos(idPaciente);
        },
        error: () => Swal.fire('Error', 'No se pudo guardar el motivo', 'error')
      });
    } else {
      this.casoClinicoService.crear(idPaciente, { motivoConsulta: this.motivoForm }).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Motivo de consulta agregado', 'success');
          this.cargarCasos(idPaciente);
        },
        error: () => Swal.fire('Error', 'No se pudo agregar el motivo', 'error')
      });
    }
  }

  guardarAntecedentes() {
    const idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    if (this.historial && this.historial.id) {
      this.historialService.actualizar(this.historial.id, this.histForm).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Antecedentes actualizados', 'success');
          this.cargarPaciente(idPaciente);
        },
        error: () => Swal.fire('Error', 'No se pudieron guardar los antecedentes', 'error')
      });
    } else {
      this.historialService.crear({ ...this.histForm, paciente: { id: idPaciente } }).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Antecedentes registrados', 'success');
          this.cargarPaciente(idPaciente);
        },
        error: () => Swal.fire('Error', 'No se pudieron guardar los antecedentes', 'error')
      });
    }
  }

  estadoDiente(diente: number): string {
    return this.odontoEstado[diente] || 'sano';
  }

  ciclarDiente(diente: number) {
    const actual = this.estadoDiente(diente);
    const idx = this.ordenOdonto.indexOf(actual);
    this.odontoEstado[diente] = this.ordenOdonto[(idx + 1) % this.ordenOdonto.length];
  }

  finalizarCaso() {
    const caso = this.casoActivo;
    if (!caso) {
      Swal.fire('Sin caso', 'No hay un caso clínico para finalizar', 'info');
      return;
    }
    Swal.fire({
      title: '¿Finalizar caso?',
      text: 'El caso se marcará como finalizado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Volver'
    }).then((res) => {
      if (res.isConfirmed) {
        this.casoClinicoService.actualizar(caso.id, { estado: 'FINALIZADO' }).subscribe({
          next: () => {
            Swal.fire('Finalizado', 'Caso finalizado correctamente', 'success');
            this.cargarCasos(Number(this.route.snapshot.paramMap.get('id')));
          },
          error: () => Swal.fire('Error', 'No se pudo finalizar el caso', 'error')
        });
      }
    });
  }

  abrirFirmar() {
    this.showFirmar = true;
    this.firmaCapturada = false;
    setTimeout(() => this.limpiarFirma(), 50);
  }

  cerrarFirmar() {
    this.showFirmar = false;
  }

  iniciarFirma(event: MouseEvent) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    this.firmando = true;
  }

  moverFirma(event: MouseEvent) {
    if (!this.firmando) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1F2937';
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
    this.firmaCapturada = true;
  }

  terminarFirma() {
    this.firmando = false;
  }

  limpiarFirma() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.firmaCapturada = false;
  }

  guardarFirma() {
    if (!this.firmaCapturada) {
      Swal.fire('Aviso', 'Capture la firma antes de continuar', 'warning');
      return;
    }
    this.showFirmar = false;
    Swal.fire('Registrado', 'Firma capturada correctamente', 'success');
  }

}