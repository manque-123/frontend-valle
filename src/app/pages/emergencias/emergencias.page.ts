import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmergenciaService, Emergencia } from '../../services/emergencia.service';

@Component({
  selector: 'app-emergencias',
  templateUrl: './emergencias.page.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EmergenciasPage implements OnInit {

  nueva: Emergencia = {
    tipo: '',
    descripcion: '',
    ubicacion: ''
  };

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
  }

  agregar() {
    if (!this.nueva.tipo || !this.nueva.descripcion || !this.nueva.ubicacion) {
      alert('Por favor, rellena todos los campos');
      return;
    }

    this.servicio.postEmergencia(this.nueva).subscribe({
      next: (res) => {
        alert('¡Emergencia reportada con éxito localmente!');
        // Limpiamos el formulario
        this.nueva = { tipo: '', descripcion: '', ubicacion: '' };
      },
      error: (err) => {
        console.error('Error al conectar con el backend:', err);
        alert('No se pudo conectar con el servidor local. Verifica que IntelliJ tenga el Play puesto.');
      }
    });
  }
}