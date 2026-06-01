import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz para estructurar los datos de la Emergencia
export interface Emergencia {
  id?: number;
  tipo: string;
  descripcion: string;
  ubicacion: string;  
  latitud: number;
  longitud: number;
  gravedad: string;   
  estado?: string;
  fechaReporte?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {

  // URL principal de tu Backend en Render (Sin la barra '/' al final)
  private apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias';

  constructor(private http: HttpClient) { }

  // 1. Obtener todas las emergencias (Para los pines del mapa)
  // GET: https://backend-0-valle.onrender.com/api/emergencias
  listarEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  // 2. Obtener una sola emergencia por ID
  // GET: https://backend-0-valle.onrender.com/api/emergencias/{id}
  obtenerEmergenciaPorId(id: number): Observable<Emergencia> {
    return this.http.get<Emergencia>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear un nuevo reporte de emergencia (Ruta explícita '/crear')
  // POST: https://backend-0-valle.onrender.com/api/emergencias/crear
  crearEmergencia(emergencia: Emergencia): Observable<Emergencia> {
    return this.http.post<Emergencia>(`${this.apiUrl}/crear`, emergencia);
  }

  // 4. Actualizar el estado de una emergencia (Para la municipalidad)
  // PUT: https://backend-0-valle.onrender.com/api/emergencias/{id}/estado
  actualizarEstado(id: number, estado: string): Observable<Emergencia> {
    // Enviamos el estado dentro de un objeto JSON estructurado como lo espera el Backend
    return this.http.put<Emergencia>(`${this.apiUrl}/${id}/estado`, { estado: estado });
  }

  // 5. Eliminar una emergencia (Opcional)
  // DELETE: https://backend-0-valle.onrender.com/api/emergencias/{id}
  eliminarEmergencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}