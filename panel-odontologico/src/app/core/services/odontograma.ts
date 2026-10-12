import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

/** Malestares marcables sobre un diente (misma nomenclatura que el backend). */
export interface CondicionDental {
  codigo: string;
  label: string;
  color: string;
}

export const CONDICIONES_DENTALES: CondicionDental[] = [
  { codigo: 'CARIES', label: 'Caries', color: '#EF4444' },
  { codigo: 'OBTURADO', label: 'Obturado', color: '#2563EB' },
  { codigo: 'AUSENTE', label: 'Ausente', color: '#94A3B8' },
  { codigo: 'EXTRACCION_INDICADA', label: 'Extracción indicada', color: '#F97316' },
  { codigo: 'ENDODONCIA', label: 'Endodoncia', color: '#7C3AED' },
  { codigo: 'CORONA', label: 'Corona', color: '#CA8A04' },
  { codigo: 'PROTESIS', label: 'Prótesis', color: '#0D9488' },
  { codigo: 'IMPLANTE', label: 'Implante', color: '#0369A1' },
  { codigo: 'FRACTURA', label: 'Fractura', color: '#DB2777' },
  { codigo: 'IMPACTADO', label: 'Impactado', color: '#9F1239' },
  { codigo: 'SUPERNUMERARIO', label: 'Supernumerario', color: '#78350F' },
  { codigo: 'MOBILIDAD', label: 'Movilidad', color: '#65A30D' },
  { codigo: 'SENSIBILIDAD', label: 'Sensibilidad', color: '#06B6D4' },
  { codigo: 'ERUPCIONADO', label: 'Erupcionado', color: '#4ADE80' }
];

/** Zonas de tejido blando evaluadas en cada consulta. */
export const ZONAS_TEJIDO_BLANDO = [
  'Labios',
  'Carrillos / Mejillas',
  'Mucosa oral',
  'Encías',
  'Paladar',
  'Lengua',
  'Piso de boca',
  'Ganglios linfáticos'
];

export const ESTADOS_TEJIDO_BLANDO = [
  { valor: 'NORMAL', etiqueta: 'Normal' },
  { valor: 'INFLAMACION', etiqueta: 'Inflamación' },
  { valor: 'SANGRADO', etiqueta: 'Sangrado' },
  { valor: 'ULCERA', etiqueta: 'Úlcera' },
  { valor: 'LESION', etiqueta: 'Lesión' },
  { valor: 'TRAUMA', etiqueta: 'Trauma' },
  { valor: 'ATROFIA', etiqueta: 'Atrofia' },
  { valor: 'NEOPLASIA', etiqueta: 'Neoplasia' },
  { valor: 'NO_EVALUADO', etiqueta: 'No evaluado' }
];

export interface OdontogramaDiente {
  numeroDiente: number;
  condiciones: string[];
}

export interface OdontogramaTejido {
  zona: string;
  estado: string;
  observacion: string;
}

export interface Odontograma {
  id: number;
  pacienteId: number;
  tipoDentadura: 'ADULTO' | 'NINO';
  observaciones: string;
  fechaRegistro: string;
  odontologoNombre: string;
  dientes: OdontogramaDiente[];
  tejidosBlandos: OdontogramaTejido[];
}

@Injectable({
  providedIn: 'root'
})
export class OdontogramaService {

  private apiUrl = 'http://localhost:8088/api/odontogramas';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) {}

  listarPorPaciente(pacienteId: number) {
    return this.http.get<Odontograma[]>(`${this.apiUrl}/paciente/${pacienteId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  obtener(id: number) {
    return this.http.get<Odontograma>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  crear(odontograma: any) {
    return this.http.post<Odontograma>(this.apiUrl, odontograma, {
      headers: this.auth.getAuthHeaders()
    });
  }

  actualizar(id: number, odontograma: any) {
    return this.http.put<Odontograma>(`${this.apiUrl}/${id}`, odontograma, {
      headers: this.auth.getAuthHeaders()
    });
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
