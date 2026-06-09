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
    /* LIBERAMOS EL SCROLL DE IONIC PARA QUE EL MAPA TENGA DESPLAZAMIENTO PROPIO */
    ion-content {
      --overflow: scroll !important;
      overflow: scroll !important;
      -webkit-overflow-scrolling: touch !important;
    }
    
    .contenedor-principal {
      padding: 15px;
      text-align: center;
      background-color: #ffffff !important;
      display: flex;
      flex-direction: column;
      min-height: 90vh;
    }

    /* CONTENEDOR DEL MAPA CON DESPLAZAMIENTO TÁCTIL ACTIVADO */
    #map {
      width: 100% !important;
      height: 350px !important;
      display: block !important;
      background-color: #cbd5e1 !important;
      touch-action: pane-x pane-y !important; /* Permite mover el mapa con los dedos en Android */
      z-index: 1 !important;
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
      this.inicializarMapaMovible();
    }, 600);
  }

  ionViewWillEnter() {
    if (!this.verFormulario) {
      setTimeout(() => {
        this.inicializarMapaMovible();
      }, 300);
    }
  }

  inicializarMapaMovible() {
    if (this.mapa) {
      this.mapa.remove();
    }

    try {
      // Configuramos el mapa con arrastre (dragging) y zoom táctil explícitamente activados
      this.mapa = L.map('map', {
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true
      }).setView([-33.5411, -70.6483], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.mapa);

      this.marker = L.marker([-33.5411, -70.6483]).addTo(this.mapa)
        .bindPopup('<b>Hola genesis</b><br>Ubicación registrada.')
        .openPopup();

      // Forzar a Leaflet a recalcular y activarse en la pantalla
      setTimeout(() => {
        this.mapa.invalidateSize();
      }, 300);

    } catch (error) {
      console.error("Error al cargar mapa interactivo:", error);
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
      this.inicializarMapaMovible();
    }, 400);
  }
}