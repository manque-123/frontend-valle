import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Emergencia {
  id?: number;
  tipo: string;
  descripcion: string;
  ubicacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {

  private apiUrl = 'http://localhost:8080/api/emergencias';

  constructor(private http: HttpClient) { }

  obtenerEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  crearEmergencia(emergencia: Emergencia): Observable<Emergencia> {
    return this.http.post<Emergencia>(this.apiUrl, emergencia);
  }

  // Versión simple para evitar errores de sintaxis
  getEmergencias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}