import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {

  private apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias';

  constructor(private http: HttpClient) {}

  getEmergencias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  postEmergencia(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateEmergencia(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteEmergencia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

