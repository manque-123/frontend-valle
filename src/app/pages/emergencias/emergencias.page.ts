import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

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
  ciudadanoId: string = '';

  private mapa?: L.Map;
  private marcador?: L.CircleMarker;

  latitud?: number;
  longitud?: number;
  direccion: string = '';
  cargandoUbicacion: boolean = true;

  nueva: any = {
    tipo: 'Incendio forestal',
    descripcion: '',
    ubicacion: ''
  };

  constructor(private servicio: EmergenciaService) {}

  ngOnInit() {
    this.verificarOCrearCiudadano();
    this.cargarEmergencias();
  }

  ionViewDidEnter() {
    this.iniciarMapa();
    this.obtenerUbicacionActual();
  }

  verificarOCrearCiudadano() {
    let idGuardado = localStorage.getItem('ciudadano_id');

    if (!idGuardado) {
      idGuardado = 'CIUDADANO-' + Math.floor(Math.random() * 1000000) + '-' + new Date().getTime();
      localStorage.setItem('ciudadano_id', idGuardado);
    }

    this.ciudadanoId = idGuardado;
    console.log('ID ÃƒÅ¡nico del Ciudadano:', this.ciudadanoId);
  }

  iniciarMapa() {
    if (this.mapa) {
      setTimeout(() => this.mapa?.invalidateSize(), 300);
      return;
    }

    this.mapa = L.map('mapaEmergencia').setView([-33.4489, -70.6693], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 500);
  }

  async obtenerUbicacionActual() {
    try {
      this.cargandoUbicacion = true;

      const permisos = await Geolocation.checkPermissions();

      if (permisos.location !== 'granted') {
        const solicitud = await Geolocation.requestPermissions();

        if (solicitud.location !== 'granted') {
          alert('Debes permitir el GPS para usar la ubicaciÃ³n.');
          this.cargandoUbicacion = false;
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

      this.mapa?.setView([this.latitud, this.longitud], 17);

      this.dibujarMarcador(this.latitud, this.longitud);

      this.direccion = await this.obtenerDireccion(this.latitud, this.longitud);

      this.nueva.ubicacion = this.direccion;

      setTimeout(() => {
        this.mapa?.invalidateSize();
      }, 500);

    } catch (error) {
      console.error('Error GPS:', error);
      alert('No se pudo obtener la ubicaciÃ³n. Revisa permisos y GPS.');
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  dibujarMarcador(lat: number, lng: number) {
    if (!this.mapa) return;

    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
      return;
    }

    this.marcador = L.circleMarker([lat, lng], {
      radius: 10,
      color: '#1976d2',
      fillColor: '#2196f3',
      fillOpacity: 0.9
    })
      .addTo(this.mapa)
      .bindPopup('Tu ubicaciÃ³n actual')
      .openPopup();
  }

  async obtenerDireccion(lat: number, lng: number): Promise<string> {
  const url = `https://backend-0-valle.onrender.com/api/geocoding/reverse?lat=${lat}&lon=${lng}`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la direcciÃ³n');
  }

  const data = await respuesta.json();

  return data.display_name || 'DirecciÃ³n no encontrada';
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
      alert('Por favor, complete la descripciÃ³n y espere la ubicaciÃ³n.');
      return;
    }

    const objetoMultiformato = {
      tipo: this.nueva.tipo,
      descripcion: this.nueva.descripcion,
      ubicacion: this.direccion,
      estado: 'PENDIENTE',
      ciudadanoId: this.ciudadanoId,
      latitud: this.latitud,
      longitud: this.longitud
    };

    this.servicio.postEmergencia(objetoMultiformato).subscribe({
      next: () => {
        alert('Reporte enviado.');
        this.cargarEmergencias();

        this.nueva = {
          tipo: 'Incendio forestal',
          descripcion: '',
          ubicacion: this.direccion
        };
      },
      error: (err) => {
        console.error('Error al enviar:', err);
        alert('Error al guardar el reporte.');
      }
    });
  }

  irAAdmin() {
    window.location.href = '#/admin-emergencias';
  }
}

