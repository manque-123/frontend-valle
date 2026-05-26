import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmergenciaService, Emergencia } from '../../services/emergencia.service';

@Component({
  selector: 'app-emergencias',
  templateUrl: './emergencias.page.html',
  // Se eliminó la línea de styleUrls para evitar el error NG2008
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EmergenciasPage implements OnInit {

  // Lista que se muestra en el *ngFor de tu HTML
  emergencias: Emergencia[] = [];

  // Objeto que se conecta con los [(ngModel)] de tus inputs
  nueva: Emergencia = {
    tipo: '',
    descripcion: '',
    ubicacion: ''
  };

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
    this.cargarEmergencias();
  }

  // Carga la lista desde el Backend (H2)
  cargarEmergencias() {
    this.servicio.obtenerEmergencias().subscribe({
      next: (data) => {
        this.emergencias = data;
      },
      error: (err) => {
        console.error("Error al conectar con el servidor", err);
      }
    });
  }

  // Esta es la función que llama tu botón (click)="agregar()"
  agregar() {
    if (this.nueva.tipo.trim() === '' || this.nueva.descripcion.trim() === '') {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    this.servicio.crearEmergencia(this.nueva).subscribe({
      next: (res) => {
        alert("¡Reporte enviado con éxito!");
        this.cargarEmergencias(); // Refresca la lista automáticamente
        // Limpia el formulario para un nuevo reporte
        this.nueva = { tipo: '', descripcion: '', ubicacion: '' };
      },
      error: (err) => {
        alert("No se pudo enviar el reporte. Verifica que el Backend esté corriendo.");
        console.error(err);
      }
    });
  }
}