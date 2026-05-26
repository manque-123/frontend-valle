import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HomePage implements OnInit {

  nombreUsuario: string = 'Usuario'; // Nombre por defecto
  mapa!: L.Map;

  constructor(private router: Router) {}

  ngOnInit() {
    // 1. Rescatamos el nombre guardado en el Login
    const usuario = localStorage.getItem('usuarioLogueado');
    if (usuario) {
      this.nombreUsuario = usuario; 
    }

    // 2. Inicializamos el mapa con delay para asegurar que el HTML exista
    setTimeout(() => {
      this.cargarMapa();
    }, 500);
  }

  cargarMapa() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.dibujarMapa(position.coords.latitude, position.coords.longitude);
        },
        () => {
          this.dibujarMapa(-33.5833, -70.6333); // Plan B: La Pintana
        }
      );
    } else {
      this.dibujarMapa(-33.5833, -70.6333);
    }
  }

  dibujarMapa(lat: number, lng: number) {
    this.mapa = L.map('mapId').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    L.marker([lat, lng]).addTo(this.mapa)
      .bindPopup(`<b>Hola ${this.nombreUsuario}</b><br>Ubicación registrada.`)
      .openPopup();
  }

  irAReportar() {
    this.router.navigate(['/emergencias']);
  }
}