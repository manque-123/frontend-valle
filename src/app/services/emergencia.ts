import { Injectable } from '@angular/core';

export interface Emergencia {
  id?: number;
  tipo: string;
  descripcion: string;
  ubicacion: string;
}