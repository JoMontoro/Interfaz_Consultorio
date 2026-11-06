import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export enum TipoProcedimiento {
  EXTRACION_DENTAL = 'EXTRACION_DENTAL',
  IMPLANTES = 'IMPLANTES',
  ENDODONCIA = 'ENDODONCIA',
  ORTONCIA = 'ORTONCIA',
  BLANQUEAMIENTO = 'BLANQUEAMIENTO',
  CIRUGIA_ORAL = 'CIRUGIA_ORAL',
  PERIODONCIA = 'PERIODONCIA',
  PROTESIS = 'PROTESIS',
  GENERAL = 'GENERAL'
}

export const ETIQUETAS_PROCEDIMIENTO: Record<TipoProcedimiento, string> = {
  [TipoProcedimiento.EXTRACION_DENTAL]: 'Extracción dental',
  [TipoProcedimiento.IMPLANTES]: 'Implantes dentales',
  [TipoProcedimiento.ENDODONCIA]: 'Endodoncia / Tratamiento de conducto',
  [TipoProcedimiento.ORTONCIA]: 'Ortodoncia',
  [TipoProcedimiento.BLANQUEAMIENTO]: 'Blanqueamiento dental',
  [TipoProcedimiento.CIRUGIA_ORAL]: 'Cirugía oral',
  [TipoProcedimiento.PERIODONCIA]: 'Periodoncia',
  [TipoProcedimiento.PROTESIS]: 'Prótesis dental',
  [TipoProcedimiento.GENERAL]: 'Consentimiento general'
};

export interface ConsentimientoGuardarRequest {
  idPaciente: number;
  idHistorialClinico?: number;
  tipoProcedimiento: TipoProcedimiento;
  titulo?: string;
  contenido?: string;
  version?: string;
  aceptado: boolean;
  firmaPacienteBase64?: string;
  firmaOdontologoBase64?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentimientoInformadoResponse {
  id?: number;
  idPaciente?: number;
  nombrePaciente?: string;
  tipoProcedimiento?: TipoProcedimiento;
  titulo?: string;
  version?: string;
  aceptado?: boolean;
  fechaAceptacion?: string;
  tieneFirmaPaciente?: boolean;
  tieneFirmaOdontologo?: boolean;
  ipAddress?: string;
  pdfRuta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsentimientoInformadoService {

  private apiUrl = 'http://localhost:8088/api/consentimiento';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return this.auth.getAuthHeaders();
  }

  /** Guarda/acepta un consentimiento informado con firma y genera el PDF */
  guardar(req: ConsentimientoGuardarRequest) {
    return this.http.post<any>(this.apiUrl, req, { headers: this.getAuthHeaders() });
  }

  /** Listado resumido de consentimientos de la cartera */
  listar() {
    return this.http.get<ConsentimientoInformadoResponse[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  /** Consentimiento vigente vinculado al historial de un paciente */
  obtenerPorPaciente(idPaciente: number) {
    return this.http.get<any>(`${this.apiUrl}/paciente/${idPaciente}`, { headers: this.getAuthHeaders() });
  }

  /** Descarga el PDF generado del consentimiento */
  descargarPdf(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
      observe: 'response'
    });
  }
}
