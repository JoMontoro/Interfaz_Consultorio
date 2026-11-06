import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PacienteService } from '../../../../core/services/paciente';
import { CasoClinicoService } from '../../../../core/services/caso-clinico';
import { HistorialService } from '../../../../core/services/historial';
import { PresupuestoService } from '../../../../core/services/presupuesto';
import { PlanTratamientoService } from '../../../../core/services/plan-tratamiento';
import { AuthService } from '../../../../core/services/auth';
import { Tratamiento, TratamientoService } from '../../../../core/services/tratamiento';
import { ConsentimientoInformadoService, TipoProcedimiento, ETIQUETAS_PROCEDIMIENTO, ConsentimientoGuardarRequest } from '../../../../core/services/consentimiento-informado';
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

  // Formularios editables
  motivoForm = '';
  histForm = { antecedentesMedicos: '', alergias: '', enfermedades: '', observacionesGenerales: '' };

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private casoClinicoService: CasoClinicoService,
    private historialService: HistorialService,
    private presupuestoService: PresupuestoService,
    private planService: PlanTratamientoService,
    private tratamientoService: TratamientoService,
    private auth: AuthService,
    private consentimientoService: ConsentimientoInformadoService
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

  tipoProcedimientoSeleccionado: TipoProcedimiento = TipoProcedimiento.GENERAL;
  tiposProcedimiento = Object.values(TipoProcedimiento);
  etiquetasProcedimiento = ETIQUETAS_PROCEDIMIENTO;

  firmaPacienteBase64: string | null = null;
  firmaOdontologoBase64: string | null = null;

  showFirmar = false;
  firmaCapturada = false;
  private firmando = false;
  @ViewChild('canvasFirma') canvasRef?: ElementRef<HTMLCanvasElement>;

  showPago = false;
  montoPago = 0;

  abrirPago() {
    this.montoPago = 0;
    // El editor arranca con el estado real del presupuesto, no en blanco.
    this.descuentoPago = this.pago?.id ? Number(this.pago.descuento) || 0 : 0;
    this.montoEditable = this.pago?.id ? this.totalPagoActual : null;
    this.showPago = true;
  }

  cerrarPago() {
    this.showPago = false;
  }

  private aplicarPresupuesto(pre: any) {
    this.pago = {
      id: pre != null ? pre.id : null,
      total: pre != null ? pre.total : null,
      subtotal: pre != null ? pre.subtotal : null,
      descuento: pre != null ? pre.descuento : null,
      montoPersonalizado: pre != null ? pre.montoPersonalizado : null,
      adelanto: pre != null ? pre.adelanto : null,
      restante: pre != null ? pre.saldoPendiente : null,
      estado: pre != null ? pre.estado : null
    };
  }

  /** El saldo llega a cero cuando el presupuesto queda cancelado (pagado). */
  get presupuestoCancelado(): boolean {
    return !!this.pago.id && (this.pago.estado === 'PAGADO' || Number(this.pago.restante) === 0);
  }

  // ===== GENERAR PRESUPUESTO CON DESCUENTO =====

  showGenerarPresupuesto = false;
  descuentoPresupuesto = 0;

  get totalConDescuento(): number {
    const subtotal = Number(this.totalCaso) || 0;
    const desc = Math.min(Math.max(Number(this.descuentoPresupuesto) || 0, 0), subtotal);
    return Math.round((subtotal - desc) * 100) / 100;
  }

  /** Al escribir el descuento en el modal de generacion, el total baja al instante. */
  alCambiarDescuentoGeneracion() {
    const subtotal = Number(this.totalCaso) || 0;
    const desc = Math.min(Math.max(Number(this.descuentoPresupuesto) || 0, 0), subtotal);
    this.descuentoPresupuesto = Math.round(desc * 100) / 100;
  }

  /** Pide el descuento y recien ahi genera el presupuesto del caso. */
  pedirGenerarPresupuesto() {
    const caso = this.casoActivo;
    if (!caso) {
      Swal.fire('Sin caso', 'Primero cree un caso clínico para el paciente', 'info');
      return;
    }
    if (this.totalCaso <= 0) {
      Swal.fire(
        'Sin tratamientos que cotizar',
        'Este caso no tiene tratamientos con precio en su plan. Genere el plan del diagnóstico primero.',
        'warning'
      );
      return;
    }
    this.descuentoPresupuesto = 0;
    this.showGenerarPresupuesto = true;
  }

  confirmarGenerarPresupuesto() {
    const caso = this.casoActivo;
    if (!caso) return;
    const descuento = Math.min(Math.max(Number(this.descuentoPresupuesto) || 0, 0), this.totalCaso);
    this.showGenerarPresupuesto = false;

    this.presupuestoService.generar(caso.id, descuento).subscribe({
      next: (pre) => {
        this.aplicarPresupuesto(pre);
        this.pago.casoId = caso.id;
        const msg = descuento > 0
          ? `Total S/ ${pre.total} (descuento S/ ${descuento} aplicado)`
          : 'Calculado a partir del plan de tratamiento del caso';
        Swal.fire('Presupuesto generado', msg, 'success').then(() => this.abrirPago());
      },
      error: (err: any) => {
        Swal.fire('No se pudo generar', this.msgError(err, 'No se pudo generar el presupuesto'), 'warning');
      }
    });
  }

  get saldoActual(): number {
    return Number(this.pago.restante) || 0;
  }

  pagarSaldoCompleto() {
    this.montoPago = this.saldoVigente;
    this.registrarPago();
  }

  /** Formato de moneda con dos decimales para el detalle del presupuesto. */
  monto(valor?: number | null): string {
    if (valor === null || valor === undefined) return '—';
    return 'S/ ' + Number(valor).toFixed(2);
  }

  registrarPago() {
    const monto = Number(this.montoPago);
    if (!this.pago.id) {
      Swal.fire('Aviso', 'Primero genere un presupuesto para este caso', 'warning');
      return;
    }
    // No se cobra sobre un total que todavia no se guardo: primero se aplica.
    if (this.cambioPendiente) {
      Swal.fire('Falta aplicar el descuento',
        'El total que ve todavia no esta guardado. Pulse Aplicar y luego registre el pago.', 'warning');
      return;
    }
    if (!monto || monto <= 0) {
      Swal.fire('Aviso', 'Ingrese un monto válido mayor a 0', 'warning');
      return;
    }
    if (monto > this.pago.restante) {
      Swal.fire('Aviso', 'El monto supera el saldo pendiente (S/ ' + this.pago.restante + ')', 'warning');
      return;
    }
    this.presupuestoService.registrarPago(this.pago.id, monto).subscribe({
      next: (res: any) => {
        // El backend responde RegistroPagoDTO: el presupuesto va anidado.
        this.aplicarPresupuesto(res?.presupuesto || res);
        this.pago.casoId = this.casoActivo?.id;
        this.montoPago = 0;
        this.cerrarPago();

        if (res?.pagoCompletado) {
          // El plan quedo vacio de pendientes: se recarga para reflejarlo.
          this.cargarPlanes();
          this.cargarCasos(Number(this.route.snapshot.paramMap.get('id')));
          const detalles = [
            res.tratamientosRealizados ? `${res.tratamientosRealizados} tratamiento(s) del plan marcados como realizados` : null,
            res.citasFinalizadas ? `${res.citasFinalizadas} cita(s) finalizadas` : null,
            res.casoFinalizado ? 'caso clínico finalizado' : null,
            res.pacienteAtendido ? 'paciente marcado como atendido' : null
          ].filter(Boolean);
          Swal.fire({
            title: 'Presupuesto cancelado',
            html: `El saldo llego a <strong>S/ 0.00</strong>.<br>` +
                  (detalles.length ? 'Ademas se actualizo: ' + detalles.join(', ') + '.' : ''),
            icon: 'success'
          });
          return;
        }

        Swal.fire('Pago registrado', 'Saldo pendiente: ' + this.monto(this.saldoActual), 'success');
      },
      error: (err: any) => {
        const msg = err?.error?.mensaje || err?.error?.message || 'No se pudo registrar el pago';
        Swal.fire('Error', msg, 'error');
      }
    });
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

  // ===== DIAGNOSTICO CLINICO (origen del plan automatico) =====

  diagnosticoForm = '';

  /**
   * Un solo guardado para motivo y diagnostico. Si el paciente es nuevo y todavia
   * no tiene caso, aqui se crea el caso clinico; si ya tiene, se actualiza.
   * Despues ofrece generar el plan, que es el siguiente paso natural.
   */
  guardarConsulta() {
    const idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    const motivo = this.motivoForm.trim();
    const diagnostico = this.diagnosticoForm.trim();
    if (!motivo && !diagnostico) {
      Swal.fire('Sin datos', 'Escriba el motivo de consulta o el diagnóstico', 'warning');
      return;
    }

    const caso = this.casoActivo;
    const peticion = caso
      ? this.casoClinicoService.actualizar(caso.id, { motivoConsulta: motivo, diagnostico: diagnostico })
      : this.casoClinicoService.crear(idPaciente, { motivoConsulta: motivo, diagnostico: diagnostico });

    peticion.subscribe({
      next: (actualizado) => {
        const destino = caso || actualizado;
        if (actualizado && destino) {
          Object.assign(destino, actualizado);
        } else if (destino) {
          destino.motivoConsulta = motivo;
          destino.diagnostico = diagnostico;
        }
        this.cargarCasos(idPaciente);
        Swal.fire({
          title: caso ? 'Guardado' : 'Caso clínico creado',
          text: '¿Generar ahora el plan de tratamiento?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, generar',
          cancelButtonText: 'Ahora no'
        }).then(r => {
          if (r.isConfirmed) this.generarPlanDesdeDiagnostico();
        });
      },
      error: (err) => Swal.fire('No se pudo guardar',
        this.msgError(err, 'Revise los datos e intente nuevamente'), 'error')
    });
  }

  /**
   * El backend propone los tratamientos del catalogo que coinciden con el
   * diagnostico y el motivo de consulta. El odontologo puede editar el resultado:
   * cambiar precios, quitar o agregar tratamientos.
   */
  generarPlanDesdeDiagnostico(forzar = false) {
    const caso = this.casoActivo;
    if (!caso) {
      Swal.fire('Sin caso', 'Este paciente no tiene un caso clinico activo', 'warning');
      return;
    }
    this.generandoPlan = true;
    this.planService.generarDesdeDiagnostico(caso.id, forzar).subscribe({
      next: (plan) => {
        this.generandoPlan = false;
        if (plan.id) this.planAbierto = plan.id;
        this.cargarPlanes();
        Swal.fire('Plan generado', 'Revise los tratamientos sugeridos y ajuste los precios si lo necesita', 'success');
      },
      error: (err) => {
        this.generandoPlan = false;
        Swal.fire('No se pudo generar', this.msgError(err), 'warning');
      }
    });
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
        this.aplicarPresupuesto(data.presupuesto || null);
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
        this.diagnosticoForm = this.casoActivo?.diagnostico || '';
        if (this.casoActivo) {
          this.pago.casoId = this.casoActivo.id;
          if (!this.pago.id && this.casoActivo.presupuestoId) {
            this.pago.id = this.casoActivo.presupuestoId;
          }
          if (!this.pago.restante && this.casoActivo.saldoPendiente) {
            this.pago.restante = this.casoActivo.saldoPendiente;
          }
        }
        this.cargarPlanes();
      },
      error: () => this.casos = []
    });
  }

  // ============ PLAN DE TRATAMIENTO ============
  // El presupuesto se calcula a partir de aqui: sin plan con precios no hay total.

  planes: any[] = [];
  detallesPorPlan: Record<number, any[]> = {};
  planAbierto: number | null = null;
  catalogo: Tratamiento[] = [];

  get soloLectura(): boolean {
    return this.auth.userProfile()?.rol === 'ADMIN';
  }

  cargarPlanes() {
    const caso = this.casoActivo;
    if (!caso) {
      this.planes = [];
      this.detallesPorPlan = {};
      return;
    }
    this.planService.listarPorCaso(caso.id).subscribe({
      next: (data) => {
        this.planes = data || [];
        this.planes.forEach(p => this.cargarDetalles(p.id));
        if (this.planAbierto === null || !this.planesActivos.some(p => p.id === this.planAbierto)) {
          this.planAbierto = this.planesActivos.length ? this.planesActivos[0].id : null;
        }
      },
      error: () => (this.planes = [])
    });
  }

  /** El plan panel muestra solo lo vigente: los planes pagados pasan al historial. */
  get planesActivos(): any[] {
    return this.planes.filter(p => p.estado !== 'COMPLETADO' && p.estado !== 'CANCELADO');
  }

  /** Planes ya cancelados (pagados): se conservan como registro clinico del paciente. */
  get planesHistorial(): any[] {
    return this.planes.filter(p => p.estado === 'COMPLETADO');
  }

  mostrarHistorial = false;

  cargarDetalles(planId: number) {
    this.planService.listarDetalles(planId).subscribe({
      next: (data) => (this.detallesPorPlan = { ...this.detallesPorPlan, [planId]: data || [] }),
      error: () => (this.detallesPorPlan = { ...this.detallesPorPlan, [planId]: [] })
    });
  }

  alternarPlan(planId: number) {
    this.planAbierto = this.planAbierto === planId ? null : planId;
    if (this.planAbierto !== null && !this.detallesPorPlan[planId]) {
      this.cargarDetalles(planId);
    }
  }

  detalles(planId: number): any[] {
    return this.detallesPorPlan[planId] || [];
  }

  /** El plan muestra lo que falta hacer: al quedar el saldo en 0, esta lista queda vacia. */
  pendientes(planId: number): any[] {
    return this.detalles(planId).filter(d => d.estado === 'PENDIENTE');
  }

  realizados(planId: number): any[] {
    return this.detalles(planId).filter(d => d.estado === 'REALIZADO');
  }

  /** Ya no queda nada por hacer en el plan. */
  planVacio(plan: any): boolean {
    return this.pendientes(plan.id).length === 0;
  }

  verRealizados: Record<number, boolean> = {};

  alternarRealizados(planId: number) {
    this.verRealizados = { ...this.verRealizados, [planId]: !this.verRealizados[planId] };
  }

  totalPlan(planId: number): number {
    return this.detalles(planId)
      .filter(d => d.estado !== 'CANCELADO')
      .reduce((suma, d) => suma + (Number(d.precio) || 0), 0);
  }

  /** Total de todo lo cotizable del caso: es lo que vera el paciente. */
  get totalCaso(): number {
    return this.planesActivos.reduce((suma, p) => suma + this.totalPlan(p.id), 0);
  }

  /** Tratamientos que aun falta atender: al llegar a cero el plan queda liquidado. */
  get pendientesCaso(): number {
    return this.planesActivos
      .reduce((suma, p) => suma + this.detalles(p.id).filter(d => d.estado === 'PENDIENTE').length, 0);
  }

  /** El precio puede departure de la referencia del catalogo. */
  guardarPrecioDetalle(planId: number, detalle: any) {
    const precio = Number(detalle.precio);
    if (isNaN(precio) || precio < 0) {
      Swal.fire('Precio invalido', 'El precio no puede ser negativo', 'warning');
      return;
    }
    this.planService.actualizarDetalle(planId, detalle.id, { precio }).subscribe({
      next: () => {
        detalle.precio = precio;
        this.cargarPlanes();
        Swal.fire('Precio actualizado', 'El presupuesto del caso se recalculo', 'success');
      },
      error: (err) => Swal.fire('No se pudo actualizar', this.msgError(err), 'error')
    });
  }

  eliminarDetalle(planId: number, detalle: any) {
    Swal.fire({
      title: '¿Quitar del plan?',
      text: `"${detalle.procedimiento}" se eliminara del plan y del presupuesto`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      confirmButtonText: 'Si, quitar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.planService.eliminarDetalle(planId, detalle.id).subscribe({
        next: () => {
          this.cargarDetalles(planId);
          Swal.fire('Eliminado', 'El presupuesto del caso se recalculo', 'success');
        },
        error: (err) => Swal.fire('No se pudo eliminar', this.msgError(err), 'error')
      });
    });
  }

  private msgError(err: any, porDefecto = 'Ocurrio un error inesperado'): string {
    return err?.error?.mensaje || err?.error?.message || err?.message || porDefecto;
  }

  // ===== GENERACION AUTOMATICA DEL PLAN A PARTIR DEL DIAGNOSTICO =====

  showGenerarModal = false;
  busquedaTratamiento = '';
  seleccion: Record<number, number> = {};   // tratamientoId -> cantidad
  nombrePlanAutogenerado = '';
  sesionesPlan = 1;
  generandoPlan = false;

  /** Un solo punto de entrada: sugerencia automatica o eleccion manual. */
  abrirGenerarPlan() {
    if (!this.casoActivo) {
      Swal.fire('Sin caso', 'Este paciente no tiene un caso clinico activo', 'warning');
      return;
    }
    this.seleccion = {};
    this.busquedaTratamiento = '';
    this.nombrePlanAutogenerado = this.planesActivos[0]?.nombre || 'Plan de tratamiento';
    this.sesionesPlan = this.planesActivos[0]?.sesionesEstimadas || 1;
    this.showGenerarModal = true;
    if (!this.catalogo.length) {
      this.tratamientoService.listarActivos().subscribe({
        next: (data) => (this.catalogo = data || []),
        error: () => (this.catalogo = [])
      });
    }
  }

  get catalogoFiltrado(): Tratamiento[] {
    const texto = this.busquedaTratamiento.trim().toLowerCase();
    if (!texto) return this.catalogo;
    return this.catalogo.filter(t =>
      (t.nombre || '').toLowerCase().includes(texto) ||
      (t.categoria || '').toLowerCase().includes(texto)
    );
  }

  cantidad(id: number): number {
    return this.seleccion[id] || 0;
  }

  alternarTratamiento(t: Tratamiento) {
    if (this.seleccion[t.id!]) {
      const copia = { ...this.seleccion };
      delete copia[t.id!];
      this.seleccion = copia;
    } else {
      this.seleccion = { ...this.seleccion, [t.id!]: 1 };
    }
  }

  get seleccionados(): { tratamiento: Tratamiento; cantidad: number }[] {
    return Object.keys(this.seleccion)
      .map(id => ({
        tratamiento: this.catalogo.find(t => t.id === Number(id))!,
        cantidad: this.seleccion[Number(id)]
      }))
      .filter(s => !!s.tratamiento);
  }

  get totalSeleccion(): number {
    return this.seleccionados.reduce(
      (suma, s) => suma + (Number(s.tratamiento.precioReferencia) || 0) * s.cantidad,
      0
    );
  }

  /** Crea el plan con lo seleccionado y refresca el presupuesto del caso. */
  generarPlanAutomatico() {
    const items = this.seleccionados;
    if (items.length === 0) {
      Swal.fire('Faltan datos', 'Seleccione al menos un tratamiento del diagnostico', 'warning');
      return;
    }
    this.generandoPlan = true;
    this.planService.generarDesdeTratamientos(this.casoActivo.id, {
      nombre: this.nombrePlanAutogenerado.trim() || 'Plan de tratamiento',
      sesionesEstimadas: Number(this.sesionesPlan) || 1,
      tratamientos: items.flatMap(s =>
        Array.from({ length: s.cantidad }).map((_, i) => ({
          tratamientoId: s.tratamiento.id!,
          precio: null
        }))
      )
    }).subscribe({
      next: (plan) => {
        this.generandoPlan = false;
        this.showGenerarModal = false;
        if (plan.id) this.planAbierto = plan.id;
        Swal.fire(
          'Plan generado',
          `Se agregaron ${items.reduce((n, s) => n + s.cantidad, 0)} tratamiento(s) al plan. ` +
          'Revise el presupuesto y ajuste los precios si lo necesita.',
          'success'
        );
        this.cargarPlanes();
      },
      error: (err) => {
        this.generandoPlan = false;
        Swal.fire('No se pudo generar el plan', this.msgError(err), 'error');
      }
    });
  }

  // ===== EDICION DEL PRESUPUESTO =====

  montoEditable: number | null = null;
  descuentoPago = 0;

  /** Subtotal del plan: la base sobre la que se aplica el descuento. */
  get basePago(): number {
    return Math.max(0, Number(this.pago?.subtotal) || 0);
  }

  /** Lo que se cobra hoy: subtotal menos descuento, ya redondeado. */
  get totalPagoActual(): number {
    const sub = this.basePago;
    const desc = Math.min(Math.max(Number(this.descuentoPago) || 0, 0), sub);
    return Math.round((sub - desc) * 100) / 100;
  }

  /** El total que se ve mientras escribe: refleja el descuento al instante. */
  get totalVigente(): number {
    if (!this.pago?.id) return 0;
    if (this.cambioPendiente) return Math.max(Number(this.montoEditable) || 0, 0);
    return Math.max(Number(this.pago.total) || 0, 0);
  }

  get saldoVigente(): number {
    return Math.max(0, Math.round((this.totalVigente - (Number(this.pago?.adelanto) || 0)) * 100) / 100);
  }

  /** Hay un descuento o total editado que aun no se guardo en el servidor. */
  get cambioPendiente(): boolean {
    if (!this.pago?.id) return false;
    const guardado = Math.round((Number(this.pago.descuento) || 0) * 100);
    const escrito = Math.round((Number(this.descuentoPago) || 0) * 100);
    if (guardado !== escrito) return true;
    return Math.round((Number(this.montoEditable) || 0) * 100) !== Math.round((Number(this.pago.total) || 0) * 100);
  }

  /**
   * Al escribir el descuento el total a cobrar baja en la misma medida, sin
   * tocar los precios del plan. Si el descuento supera el subtotal se recorta.
   */
  alCambiarDescuento() {
    const sub = this.basePago;
    const desc = Math.min(Math.max(Number(this.descuentoPago) || 0, 0), sub);
    this.descuentoPago = Math.round(desc * 100) / 100;
    this.montoEditable = this.totalPagoActual;
  }

  /** Al escribir el total a cobrar, el descuento se ajusta a la diferencia. */
  alCambiarTotal() {
    const sub = this.basePago;
    const monto = Math.min(Math.max(Number(this.montoEditable) || 0, 0), sub);
    this.montoEditable = Math.round(monto * 100) / 100;
    this.descuentoPago = Math.round(Math.max(0, sub - this.montoEditable) * 100) / 100;
  }

  /** Descuento rapido: botones de 10% y 20% sobre el subtotal. */
  aplicarDescuentoRapido(porcentaje: number) {
    this.descuentoPago = Math.round(this.basePago * porcentaje * 100) / 100;
    this.alCambiarDescuento();
  }

  /** Guarda el descuento indicado y deja el total a cobrar ya reducido. */
  guardarDescuentoPresupuesto() {
    if (!this.pago.id) return;
    this.alCambiarDescuento();
    this.presupuestoService.actualizarDescuento(this.pago.id, this.descuentoPago).subscribe({
      next: (res) => {
        this.aplicarPresupuesto(res?.presupuesto || res);
        this.descuentoPago = Number(this.pago.descuento) || 0;
        this.montoEditable = this.totalPagoActual;
        Swal.fire('Descuento aplicado',
          'El total a cobrar ahora es ' + this.monto(this.pago.total) +
          (this.pago.estado === 'PAGADO' ? ' y el presupuesto quedo cancelado.' : '.'),
          'success');
      },
      error: (err) => Swal.fire('No se pudo aplicar', this.msgError(err), 'error')
    });
  }

  /** Permite al odontologo fijar el total a cobrar (descuentos, convenios, promos). */
  guardarMontoPresupuesto() {
    if (!this.pago.id) return;
    this.alCambiarTotal();
    const monto = Math.max(Number(this.montoEditable) || 0, 0);
    this.presupuestoService.actualizarMonto(this.pago.id, monto).subscribe({
      next: (res) => {
        const pre = res?.presupuesto || res;
        this.aplicarPresupuesto(pre);
        this.descuentoPago = Number(this.pago.descuento) || 0;
        this.montoEditable = this.totalPagoActual;
        Swal.fire('Presupuesto actualizado', 'El total a cobrar ahora es ' + this.monto(this.pago.total), 'success');
      },
      error: (err) => Swal.fire('No se pudo actualizar', this.msgError(err), 'error')
    });
  }

  /** Descarta el descuento y el monto editado: vuelve a la suma del plan. */
  volverAlTotalCalculado() {
    if (!this.pago.id) return;
    this.presupuestoService.quitarMontoPersonalizado(this.pago.id).subscribe({
      next: (res) => {
        this.aplicarPresupuesto(res?.presupuesto || res);
        this.descuentoPago = 0;
        this.montoEditable = this.totalPagoActual;
        Swal.fire('Total recalculado', 'El presupuesto volvio a la suma de los tratamientos del plan', 'success');
      },
      error: (err) => Swal.fire('No se pudo recalcular', this.msgError(err), 'error')
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
    const idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    const idHistorial = this.historial?.id;

    if (!this.consentimientoAceptado) {
      Swal.fire('Aviso', 'Debe aceptar el consentimiento informado', 'warning');
      return;
    }

    if (!this.firmaPacienteBase64) {
      Swal.fire('Firma requerida', 'Para aceptar el consentimiento es obligatorio capturar la firma del paciente. Use el botón "Firmar".', 'warning');
      return;
    }

    const req: ConsentimientoGuardarRequest = {
      idPaciente,
      idHistorialClinico: idHistorial,
      tipoProcedimiento: this.tipoProcedimientoSeleccionado,
      titulo: 'Consentimiento informado - ' + this.etiquetasProcedimiento[this.tipoProcedimientoSeleccionado],
      contenido: this.consentimientoTexto,
      version: '1.0',
      aceptado: true,
      firmaPacienteBase64: this.firmaPacienteBase64,
      firmaOdontologoBase64: this.firmaOdontologoBase64 || undefined,
      ipAddress: '',
      userAgent: navigator.userAgent
    };

    this.consentimientoService.guardar(req).subscribe({
      next: () => {
        this.showConsentimiento = false;
        Swal.fire('Registrado', 'Consentimiento informado guardado con firma del paciente y PDF generado', 'success');
      },
      error: (err: any) => {
        console.error('Error detalle:', err);
        let msg = '';
        if (err?.error?.mensaje) {
          msg = err.error.mensaje;
        } else if (err?.error?.message) {
          msg = err.error.message;
        } else if (typeof err?.error === 'string') {
          msg = err.error;
        } else if (err?.message) {
          msg = err.message;
        } else {
          msg = 'Error ' + (err?.status || 500) + ': ' + (err?.statusText || 'sin respuesta del servidor');
        }
        Swal.fire('Error', msg, 'error');
      }
    });
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

  finalizarCaso() {
    const caso = this.casoActivo;
    if (!caso) {
      Swal.fire('Sin caso', 'No hay un caso clínico para finalizar', 'info');
      return;
    }
    Swal.fire({
      title: '¿Finalizar caso?',
      text: 'El caso se marcará como finalizado. El paciente y su presupuesto se conservan ' +
            'y seguirá apareciendo en la lista de pacientes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Volver'
    }).then((res) => {
      if (res.isConfirmed) {
        this.casoClinicoService.actualizar(caso.id, { estado: 'FINALIZADO' }).subscribe({
          next: () => {
            Swal.fire('Finalizado', 'Caso finalizado. El paciente sigue en su ficha y en la lista.', 'success');
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
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.firmaPacienteBase64 = canvas.toDataURL('image/png');
    this.showFirmar = false;
    Swal.fire('Firma capturada', 'La firma del paciente se registró correctamente', 'success');
  }

}