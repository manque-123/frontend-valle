import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {

  // La URL base se mantiene igual
  private apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias';

  constructor(private http: HttpClient) { }

  // El GET se queda igual (apunta a /api/emergencias)
  getEmergencias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ¡AQUÍ AGREGAMOS EL /crear QUE TU JAVA NECESITA!
  postEmergencia(emergencia: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, emergencia);
  }
}