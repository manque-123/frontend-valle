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

  nombreUsuario: string = 'Usuario'; 
  mapa!: L.Map;

  constructor(private router: Router) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogueado');
    if (usuario) {
      this.nombreUsuario = usuario; 
    }
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
          this.dibujarMapa(-33.5833, -70.6333); 
        }
      );
    } else {
      this.dibujarMapa(-33.5833, -70.6333);
    }
  }

 dibujarMapa(lat: number, lng: number) {
  // Inicializa el mapa en el contenedor 'mapId'
  this.mapa = L.map('mapId').setView([lat, lng], 15);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(this.mapa);

  L.marker([lat, lng]).addTo(this.mapa)
    .bindPopup(`<b>Hola ${this.nombreUsuario}</b><br>Ubicación registrada.`)
    .openPopup();
    
  setTimeout(() => {
    if (this.mapa) {
      this.mapa.invalidateSize();
    }
  }, 500);
}

  irAReportar() {
    this.router.navigate(['/emergencias']);
  }
}