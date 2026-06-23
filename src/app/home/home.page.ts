import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  nombreUsuario: string = '';

  latitud: number = -33.5411;
  longitud: number = -70.6483;

  ubicacionEmergencia: string = 'Presiona el botón para obtener tu ubicación actual.';
  mapaGoogleSeguro: SafeResourceUrl;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private zone: NgZone
  ) {
    this.mapaGoogleSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
  }

  ngOnInit() {
    setTimeout(() => {
      this.obtenerUbicacion();
    }, 1000);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.obtenerUbicacion();
    }, 1500);
  }

  async obtenerUbicacion() {
    try {
      await this.platform.ready();

      this.setMensaje('Solicitando permiso de ubicación...');

      const permisosActuales = await Geolocation.checkPermissions();

      if (permisosActuales.location !== 'granted') {
        const permisosSolicitados = await Geolocation.requestPermissions();

        if (permisosSolicitados.location !== 'granted') {
          this.setMensaje('Permiso de ubicación denegado. Actívalo en ajustes.');
          return;
        }
      }

      this.setMensaje('Permiso aceptado. Obteniendo GPS...');

      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      });

      this.latitud = posicion.coords.latitude;
      this.longitud = posicion.coords.longitude;

      this.zone.run(() => {
        this.mapaGoogleSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
        this.ubicacionEmergencia = `GPS obtenido: ${this.latitud}, ${this.longitud}`;
      });

      await this.obtenerDireccionEscrita(this.latitud, this.longitud);

    } catch (error) {
      console.error('ERROR GPS:', error);
      this.setMensaje('No se pudo obtener GPS. Activa la ubicación del celular y revisa permisos.');
    }
  }

  crearMapaGoogle(lat: number, lng: number): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async obtenerDireccionEscrita(lat: number, lng: number) {
    try {
      this.setMensaje('Convirtiendo GPS a dirección...');

      const url = `https://backend-0-valle.onrender.com/api/geocoding/reverse?lat=${lat}&lon=${lng}`;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        this.setMensaje(`Lat: ${lat}, Lon: ${lng}`);
        return;
      }

      const data = await respuesta.json();

      const calle = data?.address?.road || '';
      const numero = data?.address?.house_number || '';
      const comuna =
        data?.address?.suburb ||
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.municipality ||
        '';

      const direccion = `${calle} ${numero}${numero ? ',' : ''} ${comuna}`.trim();

      this.setMensaje(
        direccion ||
        data?.display_name ||
        `Lat: ${lat}, Lon: ${lng}`
      );

    } catch (error) {
      console.error('Error dirección:', error);
      this.setMensaje(`Lat: ${lat}, Lon: ${lng}`);
    }
  }

  setMensaje(mensaje: string) {
    this.zone.run(() => {
      this.ubicacionEmergencia = mensaje;
    });
  }

  irAReportar() {
    this.router.navigateByUrl('/mapa');
  }
}