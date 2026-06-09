import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {

  // La URL base se mantiene igual hacia tu servidor de Render
  private apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias';

  constructor(private http: HttpClient) { }

  // El GET se queda igual (apunta a /api/emergencias)
  getEmergencias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // El POST se mantiene igual (apunta a /api/emergencias/crear)
  postEmergencia(emergencia: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, emergencia);
  }

  // ¡AQUÍ AGREGAMOS LA FUNCIÓN PARA ACTUALIZAR EL ESTADO DESDE EL ADMIN!
  // Esta función envía el objeto con el nuevo estado hacia tu Java en Render
  updateEmergencia(id: any, emergenciaActualizada: any): Observable<any> {
    // Si tu backend de Java usa la ruta estándar para editar (ej: /api/emergencias/actualizar/5)
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, emergenciaActualizada);
    
    // NOTA POR SI TU JAVA NO USA "/actualizar": 
    // Si te llega a marcar error 404 al presionar los botones, borra la línea de arriba 
    // y usa esta otra en su lugar:
    // return this.http.put(`${this.apiUrl}/${id}`, emergenciaActualizada);
  }
}