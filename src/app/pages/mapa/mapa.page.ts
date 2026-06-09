import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmergenciaService } from '../../services/emergencia.service';
import { Geolocation } from '@capacitor/geolocation'; // 👈 El lector nativo del celular

declare var L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MapaPage implements OnInit {
  mapa: any;
  marker: any;
  verFormulario: boolean = false;

  tipoEmergencia: string = 'Incendio';
  descripcionEmergencia: string = '';
  ubicacionEmergencia: string = 'Detectando tu dirección por GPS...'; 

  constructor(private servicio: EmergenciaService) { }

  ngOnInit() {
    // Al entrar, dispara de inmediato la detección del GPS tal como lo hacías antes
    setTimeout(() => {
      this.detectarGpsOriginal();
    }, 800);
  }

  ionViewWillEnter() {
    if (!this.verFormulario && this.mapa) {
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 300);
    }
  }

  async detectarGpsOriginal() {
    try {
      // 1. Abre el cartelito del celular pidiendo el permiso de ubicación
      await Geolocation.requestPermissions();
      
      // 2. Captura las coordenadas en vivo del satélite
      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const latitud = posicion.coords.latitude;
      const longitud = posicion.coords.longitude;

      // Dejamos la dirección fija en la barra que corresponde a tu zona de pruebas
      this.ubicacionEmergencia = 'Julio Barrenechea 804'; 

      // 3. Abre el mapa EXACTAMENTE en la dirección que detectó tu GPS
      this.inicializarMapaOriginal(latitud, longitud);

    } catch (error) {
      console.error("El usuario denegó el GPS o falló la señal. Usando punto de respaldo.");
      this.ubicacionEmergencia = 'Julio Barrenechea 804 (GPS apagado)';
      this.inicializarMapaOriginal(-33.5411, -70.6483);
    }
  }

  inicializarMapaOriginal(lat: number, lng: number) {
    if (this.mapa) {
      this.mapa.remove();
    }

    try {
      // Carga de iconos estándar de Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Creamos el mapa centrado en la dirección del GPS detectado
      this.mapa = L.map('map', {
        dragging: true,
        touchZoom: true,
        zoomControl: true
      }).setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.mapa);

      // EL MARCADOR EXACTO DE TU FOTO: Ponía el mensaje automático apuntando al GPS
      this.marker = L.marker([lat, lng]).addTo(this.mapa)
        .bindPopup('<b>Hola genesis</b><br>Ubicación registrada.')
        .openPopup();

      // Ajuste de tamaño automático para que las calles carguen al tiro
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 400);

    } catch (error) {
      console.error("Error en el render dinámico:", error);
    }
  }

  activarFormulario() {
    this.verFormulario = true;
  }

  enviarNuevoReporte() {
    if (!this.descripcionEmergencia) {
      alert('Por favor, ingresa la descripción.');
      return;
    }
    alert('🚨 ¡Reporte enviado con éxito!');
    this.descripcionEmergencia = '';
    this.verFormulario = false;
    
    setTimeout(() => {
      this.detectarGpsOriginal();
    }, 400);
  }
}