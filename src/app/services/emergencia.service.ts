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
  
  // URL Correcta que coincide con tu application.properties (Puerto 8080)
  private apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias/crear';
  constructor(private http: HttpClient) { }

  getEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  postEmergencia(emergencia: Emergencia): Observable<Emergencia> {
    return this.http.post<Emergencia>(`${this.apiUrl}/crear`, emergencia);
  }
}