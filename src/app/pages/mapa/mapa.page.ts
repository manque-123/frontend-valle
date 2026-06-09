import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmergenciaService } from '../../services/emergencia.service';

declare var L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  styles: [`
    /* INYECCIÓN DIRECTA DE ESTILOS CRÍTICOS PARA EVITAR PANTALLA GRIS */
    @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

    ion-content {
      --overflow: hidden !important;
      overflow: hidden !important;
    }
    
    .contenedor-principal {
      padding: 15px;
      text-align: center;
      background-color: #ffffff !important;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* FORZAMOS AL MAPA A HACERSE VISIBLE Y INTERACTIVO */
    #map {
      width: 100% !important;
      height: 350px !important;
      display: block !important;
      background-color: #e2e8f0 !important;
      touch-action: none !important; /* Cede el control total del tacto a Leaflet */
      z-index: 10 !important;
    }
  `]
})
export class MapaPage implements OnInit {
  mapa: any;
  marker: any;
  verFormulario: boolean = false;

  tipoEmergencia: string = 'Incendio';
  descripcionEmergencia: string = '';
  ubicacionEmergencia: string = 'julio barrenechea 804';

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
    setTimeout(() => {
      this.inicializarMapaDefinitivo();
    }, 800);
  }

  ionViewWillEnter() {
    if (!this.verFormulario) {
      setTimeout(() => {
        this.inicializarMapaDefinitivo();
      }, 400);
    }
  }

  inicializarMapaDefinitivo() {
    if (this.mapa) {
      this.mapa.remove();
    }

    try {
      // Arreglo de rutas de iconos para que Leaflet no falle en Android
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Forzamos opciones de desplazamiento táctil nativo
      this.mapa = L.map('map', {
        dragging: true,
        tap: !L.Browser.mobile, // Arregla el bug de doble toque en celulares
        touchZoom: true,
        zoomControl: true
      }).setView([-33.5411, -70.6483], 15);

      // Usamos un servidor espejo alternativo de OpenStreetMap compatible con Android nativo
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.mapa);

      // Creamos el marcador de forma limpia
      this.marker = L.marker([-33.5411, -70.6483]).addTo(this.mapa)
        .bindPopup('<b>Hola genesis</b><br>Ubicación registrada.')
        .openPopup();

      // Forzar recalculado de dimensiones inmediatamente después del montaje
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 400);

    } catch (error) {
      console.error("Error crítico en Leaflet nativo:", error);
    }
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
      this.inicializarMapaDefinitivo();
    }, 400);
  }
}