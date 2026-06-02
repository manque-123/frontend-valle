import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export interface Emergencia {
  id?: number;
  tipo: string;
  descripcion: string;
  ubicacion: string;
}
