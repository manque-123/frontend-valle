import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

import { EmergenciaService } from '../../services/emergencia.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MapaPage implements OnInit {

  mapa?: L.Map;
  marker?: L.Marker;

  verFormulario: boolean = false;
  cargandoUbicacion: boolean = true;

  tipoEmergencia: string = 'Incendio';
  descripcionEmergencia: string = '';

  ubicacionEmergencia: string = 'Esperando señal del GPS...';

  latitud?: number;
  longitud?: number;

  constructor(private servicio: EmergenciaService) {}

  ngOnInit() {
    setTimeout(() => {
      this.detectarGps();
    }, 1000);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 600);
  }

  async detectarGps() {
    try {
      this.cargandoUbicacion = true;

      const permisos = await Geolocation.checkPermissions();

      if (permisos.location !== 'granted') {
        const solicitud = await Geolocation.requestPermissions();

        if (solicitud.location !== 'granted') {
          this.ubicacionEmergencia = 'Permiso GPS denegado';
          this.cargandoUbicacion = false;
          this.inicializarMapa(-33.5411, -70.6483);
          return;
        }
      }

      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      this.latitud = posicion.coords.latitude;
      this.longitud = posicion.coords.longitude;

      this.ubicacionEmergencia = await this.obtenerDireccion(this.latitud, this.longitud);

      this.inicializarMapa(this.latitud, this.longitud);

    } catch (error) {
      console.error('Error GPS:', error);

      this.ubicacionEmergencia = 'Ubicación no disponible';

      this.latitud = -33.5411;
      this.longitud = -70.6483;

      this.inicializarMapa(this.latitud, this.longitud);

    } finally {
      this.cargandoUbicacion = false;
    }
  }

  async obtenerDireccion(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://backend-0-valle.onrender.com/api/geocoding/reverse?lat=${lat}&lon=${lng}`;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        return 'Dirección no disponible';
      }

      const data = await respuesta.json();

      if (data?.address) {
        const calle = data.address.road || '';
        const numero = data.address.house_number || '';
        const comuna =
          data.address.suburb ||
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          '';

        const direccionCorta = `${calle} ${numero}${numero ? ',' : ''} ${comuna}`.trim();

        if (direccionCorta.length > 3) {
          return direccionCorta;
        }
      }

      return data.display_name || 'Dirección no encontrada';

    } catch (error) {
      console.error('Error dirección:', error);
      return 'Dirección no disponible';
    }
  }

  inicializarMapa(lat: number, lng: number) {
    try {
      this.configurarIconosLeaflet();

      if (this.mapa) {
        this.mapa.remove();
        this.mapa = undefined;
      }

      const contenedor =
        document.getElementById('mapaLeaflet') ||
        document.getElementById('mapId') ||
        document.getElementById('map');

      if (!contenedor) {
        console.error('No existe contenedor para el mapa');
        return;
      }

      this.mapa = L.map(contenedor, {
        dragging: true,
        touchZoom: true,
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([lat, lng], 17);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.mapa);

      this.marker = L.marker([lat, lng])
        .addTo(this.mapa)
        .bindPopup(`<b>Ubicación registrada</b><br>${this.ubicacionEmergencia}`)
        .openPopup();

      setTimeout(() => {
        this.mapa?.invalidateSize();
      }, 800);

    } catch (error) {
      console.error('Error al cargar Leaflet:', error);
    }
  }

  configurarIconosLeaflet() {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  activarFormulario() {
    this.verFormulario = true;

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 500);
  }

  enviarNuevoReporte() {
    if (!this.descripcionEmergencia.trim()) {
      alert('Por favor, ingresa la descripción de la emergencia.');
      return;
    }

    const reporte = {
      tipo: this.tipoEmergencia,
      descripcion: this.descripcionEmergencia,
      ubicacion: this.ubicacionEmergencia,
      estado: 'PENDIENTE',
      latitud: this.latitud,
      longitud: this.longitud
    };

    this.servicio.postEmergencia(reporte).subscribe({
      next: () => {
        alert('Reporte enviado con éxito.');

        this.descripcionEmergencia = '';
        this.tipoEmergencia = 'Incendio';
        this.verFormulario = false;

        setTimeout(() => {
          this.detectarGps();
        }, 500);
      },
      error: (err) => {
        console.error('Error al enviar reporte:', err);
        alert('Error al guardar el reporte en Render.');
      }
    });
  }
}
