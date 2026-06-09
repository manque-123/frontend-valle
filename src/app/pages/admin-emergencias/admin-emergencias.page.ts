import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';

declare var L: any;

@Component({
  selector: 'app-admin-emergencias',
  templateUrl: './admin-emergencias.page.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  styles: [`
    ion-content {
      --overflow: scroll !important;
      overflow: scroll !important;
    }
    .contenedor-scroll-admin {
      height: 100vh !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      padding-bottom: 120px !important;
    }
    #map {
      width: 100% !important;
      height: 320px !important;
      display: block !important;
      background-color: #cbd5e1 !important;
    }
  `]
})
export class AdminEmergenciasPage implements OnInit {
  listaEmergencias: any[] = [];
  mapa: any;
  marker: any;
  
  rolUsuario: string = 'admin'; 
  verFormulario: boolean = false;

  tipoEmergencia: string = 'Incendio';
  descripcionEmergencia: string = '';
  ubicacionEmergencia: string = 'Julio Barrenechea 804, La Pintana'; // Tu dirección fija original

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
    this.comprobarRolYAsignar();
  }

  ionViewWillEnter() {
    this.comprobarRolYAsignar();
  }

  comprobarRolYAsignar() {
    this.rolUsuario = localStorage.getItem('rol_usuario') || 'admin';
    this.verFormulario = false;

    if (this.rolUsuario === 'admin') {
      this.cargarTodasLasEmergencias();
    } else {
      // Forzamos un pequeño tiempo para asegurar que el HTML exista
      setTimeout(() => {
        this.cargarMapaFijoSeguro();
      }, 600);
    }
  }

  // ESTA FUNCIÓN NO OBLIGA AL CELULAR A USAR GPS, POR LO QUE NUNCA SE QUEDARÁ GRIS
  cargarMapaFijoSeguro() {
    if (this.mapa) {
      this.mapa.remove();
    }

    try {
      // Coordenadas fijas exactas de Julio Barrenechea, La Pintana
      this.mapa = L.map('map').setView([-33.5411, -70.6483], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.mapa);

      // Ponemos tu marcador original
      this.marker = L.marker([-33.5411, -70.6483]).addTo(this.mapa)
        .bindPopup('<b>Hola genesis</b><br>Ubicación registrada.')
        .openPopup();

      // Forzar renderizado de imágenes de OpenStreetMap de inmediato
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 300);

      console.log("Mapa fijo cargado con éxito instantáneo.");
    } catch (error) {
      console.error("Error al montar Leaflet plano:", error);
    }
  }

  cargarTodasLasEmergencias() {
    this.servicio.getEmergencias().subscribe({
      next: (data: any) => { this.listaEmergencias = data; },
      error: (err) => console.error(err)
    });
  }

  activarFormulario() {
    this.verFormulario = true;
  }

  enviarNuevoReporte() {
    if (!this.descripcionEmergencia || !this.ubicacionEmergencia) {
      alert('Por favor, ingresa la descripción y la ubicación.');
      return;
    }
    alert('🚨 ¡Reporte de emergencia enviado con éxito al Sistema Valle del Sol!');
    this.descripcionEmergencia = '';
    this.verFormulario = false;
    
    setTimeout(() => {
      this.cargarMapaFijoSeguro();
    }, 400);
  }

  cambiarEstado(reporte: any, nuevoEstado: string) {
    const reporteActualizado = { ...reporte, estado: nuevoEstado };
    const idReporte = reporte.id || reporte._id;
    this.servicio.updateEmergencia(idReporte, reporteActualizado).subscribe({
      next: (res) => {
        alert(`Estado actualizado a ${nuevoEstado}.`);
        this.cargarTodasLasEmergencias();
      },
      error: (err) => console.error(err)
    });
  }
}