import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';

@Component({
  selector: 'app-emergencias',
  templateUrl: './emergencias.page.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EmergenciasPage implements OnInit {
  listaEmergencias: any[] = [];
  
  nueva: any = {
    tipo: '',
    descripcion: '',
    ubicacion: ''
  };

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
    this.cargarEmergencias();
  }

  cargarEmergencias() {
    this.servicio.getEmergencias().subscribe({
      next: (data: any) => {
        this.listaEmergencias = data;
      },
      error: (err) => console.error('Error al cargar', err)
    });
  }

  enviarEmergencia() {
    if (!this.nueva.tipo || !this.nueva.descripcion || !this.nueva.ubicacion) {
      alert('Por favor, rellene todos los campos.');
      return;
    }

    // Enviamos las variantes por si tu backend en Java usa tildes en sus atributos
    const objetoMultiformato = {
      tipo: this.nueva.tipo,
      descripcion: this.nueva.descripcion,
      descripción: this.nueva.descripcion, 
      ubicacion: this.nueva.ubicacion,
      ubicación: this.nueva.ubicacion,     
      estado: 'PENDIENTE'
    };

    this.servicio.postEmergencia(objetoMultiformato).subscribe({
      next: (res) => {
        alert('¡Emergencia reportada con éxito!');
        this.cargarEmergencias(); 
        this.nueva = { tipo: '', descripcion: '', ubicacion: '' }; 
      },
      error: (err) => {
        console.error('Error al enviar:', err);
        alert('Error al guardar el reporte.');
      }
    });
  }
}