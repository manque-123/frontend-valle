import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EmergenciaService, Emergencia } from '../../services/emergencia.service';

@Component({
  selector: 'app-emergencias',
  templateUrl: './emergencias.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class EmergenciasPage implements OnInit {

  emergencias: Emergencia[] = [];

  nueva: Emergencia = {
    tipo: '',
    descripcion: '',
    ubicacion: ''
  };

  constructor(private servicio: EmergenciaService) {}

  ngOnInit() {
    this.cargarEmergencias();
  }

  cargarEmergencias() {
    this.servicio.obtenerEmergencias().subscribe(data => {
      this.emergencias = data;
    });
  }

  agregar() {
    this.servicio.crearEmergencia(this.nueva).subscribe(() => {
      this.cargarEmergencias();
      this.nueva = { tipo: '', descripcion: '', ubicacion: '' };
    });
  }

}