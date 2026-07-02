import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';

import { EmergenciaService } from '../../services/emergencia.service';

@Component({
selector: 'app-admin-emergencias',
templateUrl: './admin-emergencias.page.html',
styleUrls: ['./admin-emergencias.page.scss'],
standalone: true,
imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminEmergenciasPage implements OnInit {

listaEmergencias: any[] = [];
misReportes: any[] = [];

nombreUsuario: string = '';
rolUsuario: string = 'ciudadano';
filtroAdmin: string = 'todos';

verFormulario: boolean = false;

tipoEmergencia: string = 'Incendio';
gravedadEmergencia: string = 'Media';

descripcionEmergencia: string = '';
evidenciaFoto: string = '';

ubicacionEmergencia: string = 'Obteniendo direccion actual...';

latitud: number = -33.5411;
longitud: number = -70.6483;

mapaGoogleSeguro: SafeResourceUrl;
mapaAdminSeguro: SafeResourceUrl;

gpsEnProceso: boolean = false;
gpsYaSolicitado: boolean = false;
enviandoReporte: boolean = false;

actualizadorHistorial: any = null;

listaAlertas: any[] = [];
mensajeAlerta: string = '';
zonaAlerta: string = 'Media';
rutaSegura: string = '';

constructor(
private servicio: EmergenciaService,
private sanitizer: DomSanitizer,
private platform: Platform,
private zone: NgZone,
private router: Router
) {
this.mapaGoogleSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
this.mapaAdminSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
}

ngOnInit() {
this.cargarAlertasComunitarias();
this.comprobarRolYAsignar();
}

ionViewDidEnter() {
this.cargarAlertasComunitarias();
this.comprobarRolYAsignar();
}

ngOnDestroy() {
if (this.actualizadorHistorial) {
clearInterval(this.actualizadorHistorial);
}
}

comprobarRolYAsignar() {
this.cargarNombreUsuario();

this.rolUsuario = localStorage.getItem('rol_usuario') || 'ciudadano';

if (this.rolUsuario === 'admin' || this.rolUsuario === 'bomberos' || this.rolUsuario === 'brigada') {
  this.cargarTodasLasEmergencias();
  return;
}

this.iniciarGpsAutomatico();
this.iniciarActualizacionHistorial();

}

cargarNombreUsuario() {
const nombreGuardado =
localStorage.getItem('nombre_usuario') ||
localStorage.getItem('nombreUsuario') ||
localStorage.getItem('usuario_nombre') ||
localStorage.getItem('user_name') ||
localStorage.getItem('nombre') ||
'';

this.nombreUsuario = nombreGuardado.trim();

}

iniciarGpsAutomatico() {
if (this.gpsYaSolicitado || this.gpsEnProceso) {
return;
}

this.gpsYaSolicitado = true;

setTimeout(() => {
  this.obtenerUbicacionReal();
}, 400);

}

crearMapaGoogle(lat: number, lon: number): SafeResourceUrl {
const url = 'https://maps.google.com/maps?q=' + lat + ',' + lon + '&z=17&output=embed';
return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

async obtenerUbicacionReal() {
if (this.gpsEnProceso) {
return;
}

try {
  this.gpsEnProceso = true;

  await this.platform.ready();

  this.setMensaje('Solicitando permiso de ubicacion...');

  const permisosActuales = await Geolocation.checkPermissions();

  if (permisosActuales.location !== 'granted') {
    const permisosSolicitados = await Geolocation.requestPermissions();

    if (permisosSolicitados.location !== 'granted') {
      this.setMensaje('Permiso de ubicacion denegado. Activalo en ajustes.');
      return;
    }
  }

  this.setMensaje('Obteniendo ubicacion actual...');

  const posicion = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
  });

  this.latitud = posicion.coords.latitude;
  this.longitud = posicion.coords.longitude;

  this.zone.run(() => {
    this.mapaGoogleSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
  });

  await this.obtenerDireccionEscrita(this.latitud, this.longitud);

} catch (error) {
  console.error('ERROR GPS:', error);
  this.setMensaje('No se pudo obtener la direccion actual. Revisa permisos, internet y GPS.');
} finally {
  this.gpsEnProceso = false;
}

}

async obtenerDireccionEscrita(lat: number, lon: number) {
try {
this.setMensaje('Buscando direccion escrita...');

  const data = await this.consultarDireccionRapida(lat, lon);
  const direccion = this.formatearDireccion(data);

  if (direccion && direccion.length > 3) {
    this.setMensaje(direccion);
    return;
  }

  this.setMensaje('Direccion cercana detectada, pero sin nombre exacto.');

} catch (error) {
  console.error('Error direccion:', error);
  this.setMensaje('No se pudo obtener el nombre de la direccion. Revisa internet e intenta nuevamente.');
}

}

async consultarDireccionRapida(lat: number, lon: number): Promise<any> {
const urls = [
'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon + '&addressdetails=1&accept-language=es',
'https://backend-0-valle.onrender.com/api/geocoding/reverse?lat=' + lat + '&lon=' + lon
];

for (let vuelta = 1; vuelta <= 2; vuelta++) {
  for (const url of urls) {
    try {
      this.setMensaje('Buscando direccion escrita...');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const respuesta = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!respuesta.ok) {
        continue;
      }

      const data = await respuesta.json();

      if (data) {
        return data;
      }

    } catch (error) {
      console.error('Error consultando direccion:', error);
    }
  }

  this.setMensaje('Reintentando obtener direccion...');
  await new Promise(resolve => setTimeout(resolve, 1200));
}

throw new Error('No se pudo obtener direccion escrita');

}

formatearDireccion(data: any): string {
const respuesta = data?.data || data?.result || data;
const address = respuesta?.address || {};

if (respuesta?.direccion) {
  return respuesta.direccion;
}

if (respuesta?.formatted_address) {
  return respuesta.formatted_address;
}

const calle =
  address?.road ||
  address?.pedestrian ||
  address?.footway ||
  address?.residential ||
  address?.path ||
  address?.neighbourhood ||
  '';

const numero = address?.house_number || '';

const comuna =
  address?.suburb ||
  address?.city_district ||
  address?.municipality ||
  address?.city ||
  address?.town ||
  address?.county ||
  '';

const sector =
  address?.neighbourhood ||
  address?.quarter ||
  address?.suburb ||
  '';

if (calle && numero && comuna) {
  return calle + ' ' + numero + ', ' + comuna;
}

if (calle && comuna) {
  return calle + ', ' + comuna;
}

if (calle && numero) {
  return calle + ' ' + numero;
}

if (sector && comuna) {
  return sector + ', ' + comuna;
}

if (comuna) {
  return 'Sector ' + comuna;
}

if (respuesta?.display_name) {
  return respuesta.display_name
    .split(',')
    .slice(0, 4)
    .join(',')
    .trim();
}

return '';

}

setMensaje(mensaje: string) {
this.zone.run(() => {
this.ubicacionEmergencia = mensaje;
});
}

seleccionarEvidencia(event: any) {
const archivo = event.target.files && event.target.files[0];

if (!archivo) {
  return;
}

const lector = new FileReader();

lector.onload = () => {
  this.evidenciaFoto = lector.result as string;
};

lector.readAsDataURL(archivo);

}

async tomarFotoEvidencia() {
try {
const aceptarUsoCamara = confirm('La app necesita usar la camara para adjuntar evidencia del reporte. Deseas permitir el uso de la camara ahora?');

  if (!aceptarUsoCamara) {
    alert('No se adjunto evidencia fotografica.');
    return;
  }

  const permisosAntes = await Camera.checkPermissions();

  if (permisosAntes.camera !== 'granted') {
    const permisos = await Camera.requestPermissions({
      permissions: ['camera']
    });

    if (permisos.camera !== 'granted') {
      alert('Permiso de camara denegado. Activalo en los ajustes del celular.');
      return;
    }
  }

  const foto = await Camera.getPhoto({
    quality: 70,
    width: 900,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera
  });

  this.evidenciaFoto = foto.dataUrl || '';

} catch (error) {
  console.error('Error al abrir la camara:', error);
  alert('No se pudo abrir la camara. Revisa los permisos del celular.');
}

}

activarFormulario() {
this.verFormulario = true;
}

async enviarNuevoReporte() {
  if (this.enviandoReporte) {
    return;
  }

  if (!this.descripcionEmergencia || !this.descripcionEmergencia.trim()) {
    alert('Debes escribir una descripcion de la emergencia.');
    return;
  }

  if (
    !this.ubicacionEmergencia ||
    this.ubicacionEmergencia.includes('Obteniendo') ||
    this.ubicacionEmergencia.includes('Buscando') ||
    this.ubicacionEmergencia.includes('Solicitando') ||
    this.ubicacionEmergencia.includes('Reintentando') ||
    this.ubicacionEmergencia.includes('No se pudo') ||
    this.ubicacionEmergencia.includes('denegado')
  ) {
    alert('Espera a que la app detecte la direccion antes de enviar el reporte.');
    return;
  }

  this.enviandoReporte = true;

  const reporteServidor: any = {
    tipo: this.tipoEmergencia,
    gravedad: this.gravedadEmergencia,
    descripcion: this.descripcionEmergencia.trim(),
    evidenciaFoto: this.evidenciaFoto,
    ubicacion: this.ubicacionEmergencia,
    latitud: this.latitud,
    longitud: this.longitud,
    estado: 'PENDIENTE',
    ciudadano: this.nombreUsuario || 'Ciudadano',
    responsable: 'Pendiente',
    fecha: new Date().toISOString()
  };

  this.servicio.postEmergencia(reporteServidor).subscribe({
    next: () => {
      this.descripcionEmergencia = '';
      this.evidenciaFoto = '';
      this.tipoEmergencia = 'Incendio';
      this.gravedadEmergencia = 'Media';
      this.verFormulario = false;
      this.enviandoReporte = false;

      this.cargarTodasLasEmergencias();
      this.cargarMisReportes();

      alert('Reporte enviado.');
    },
    error: (err) => {
      console.error('Error enviando reporte al servidor:', err);
      this.enviandoReporte = false;
      alert('No se pudo guardar el reporte en el servidor.');
    }
  });
}

async enviarReporteServidor(reporte: any): Promise<void> {
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 6000);

try {
  const respuesta = await fetch('https://backend-0-valle.onrender.com/api/emergencias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(reporte),
    signal: controller.signal
  });

  clearTimeout(timeout);

  if (!respuesta.ok) {
    throw new Error('Servidor respondio con estado ' + respuesta.status);
  }

} catch (error) {
  clearTimeout(timeout);
  throw error;
}

}

obtenerReportesOcultos(): string[] {
try {
return JSON.parse(localStorage.getItem('reportes_ocultos') || '[]');
} catch (error) {
return [];
}
}

guardarReportesOcultos(ids: string[]) {
localStorage.setItem('reportes_ocultos', JSON.stringify(ids));
}

ocultarReportePorId(id: string) {
const ocultos = this.obtenerReportesOcultos();

if (!ocultos.includes(id)) {
  ocultos.push(id);
}

this.guardarReportesOcultos(ocultos);

}

eliminarReporte(reporte: any) {
  const id = (reporte.id || reporte._id || '').toString();

  if (!id) {
    alert('No se encontro el ID del reporte.');
    return;
  }

  const confirmar = confirm('Seguro que deseas eliminar este reporte?');

  if (!confirmar) {
    return;
  }

  const eliminarDePantalla = () => {
    this.ocultarReportePorId(id);

    const locales = this.obtenerReportesLocales().filter((item: any) => {
      const itemId = (item._id || item.id || '').toString();
      return itemId !== id;
    });

    this.guardarReportesLocales(locales);

    this.listaEmergencias = this.listaEmergencias.filter((item: any) => {
      const itemId = (item._id || item.id || '').toString();
      return itemId !== id;
    });

    this.misReportes = this.misReportes.filter((item: any) => {
      const itemId = (item._id || item.id || '').toString();
      return itemId !== id;
    });
  };

  if (id.startsWith('local-')) {
    eliminarDePantalla();
    alert('Reporte eliminado localmente.');
    return;
  }

  this.servicio.deleteEmergencia(Number(id)).subscribe({
    next: () => {
      eliminarDePantalla();
      alert('Reporte eliminado correctamente.');
    },
    error: (err) => {
      console.error('Error eliminando reporte:', err);
      alert('No se pudo eliminar el reporte en el servidor.');
    }
  });
}

obtenerReportesLocales(): any[] {
try {
return JSON.parse(localStorage.getItem('reportes_locales') || '[]');
} catch (error) {
return [];
}
}

guardarReportesLocales(reportes: any[]) {
localStorage.setItem('reportes_locales', JSON.stringify(reportes));
}

guardarReporteLocal(reporte: any) {
const reportesLocales = this.obtenerReportesLocales();

const existe = reportesLocales.some((item: any) => {
  return item._id === reporte._id;
});

if (!existe) {
  reportesLocales.unshift(reporte);
  this.guardarReportesLocales(reportesLocales);
}

this.misReportes = this.unirReportes([], reportesLocales);

}

actualizarReporteLocal(reporteActualizado: any) {
const reportesLocales = this.obtenerReportesLocales();

const nuevosReportes = reportesLocales.map((item: any) => {
  const itemId = item._id || item.id;
  const actualizadoId = reporteActualizado._id || reporteActualizado.id;

  if (itemId === actualizadoId) {
    return reporteActualizado;
  }

  return item;
});

this.guardarReportesLocales(nuevosReportes);

}

unirReportes(servidor: any[], locales: any[]): any[] {
  const resultado: any[] = [];
  const ids = new Set<string>();
  const ocultos = this.obtenerReportesOcultos();

  [...servidor, ...locales].forEach((reporte: any) => {
    const id = (reporte.id || reporte._id || '').toString();

    if (id.startsWith('local-') && ocultos.includes(id)) {
      return;
    }

    if (id && ids.has(id)) {
      return;
    }

    if (id) {
      ids.add(id);
    }

    resultado.push(reporte);
  });

  return resultado.sort((a: any, b: any) => {
    const fechaA = new Date(a.fecha || a.createdAt || 0).getTime();
    const fechaB = new Date(b.fecha || b.createdAt || 0).getTime();
    return fechaB - fechaA;
  });
}

iniciarActualizacionHistorial() {
this.cargarMisReportes();

if (this.actualizadorHistorial) {
  clearInterval(this.actualizadorHistorial);
}

this.actualizadorHistorial = setInterval(() => {
  this.cargarMisReportes();
}, 8000);

}

cargarMisReportes() {
  const locales = this.obtenerReportesLocales();

  this.servicio.getEmergencias().subscribe({
    next: (data) => {
      const servidor = Array.isArray(data) ? data : [];
      this.misReportes = this.unirReportes(servidor, locales);
    },
    error: (err) => {
      console.error('Error cargando mis reportes:', err);
      this.misReportes = locales;
    }
  });
}

cargarTodasLasEmergencias() {
const locales = this.obtenerReportesLocales();

this.listaEmergencias = locales;
this.actualizarMapaAdmin();

this.servicio.getEmergencias().subscribe({
  next: (data) => {
    const servidor = Array.isArray(data) ? data : [];
    this.listaEmergencias = this.unirReportes(servidor, locales);
    this.actualizarMapaAdmin();
  },
  error: (err) => {
    console.error('Error cargando emergencias:', err);
    this.listaEmergencias = locales;
    this.actualizarMapaAdmin();
  }
});

}

actualizarMapaAdmin() {
const reporteConCoordenadas = this.listaEmergencias.find((reporte: any) => {
return reporte.latitud && (reporte.longitud || reporte.longitude || reporte.lng);
});

if (!reporteConCoordenadas) {
  this.mapaAdminSeguro = this.crearMapaGoogle(this.latitud, this.longitud);
  return;
}

const lat = Number(reporteConCoordenadas.latitud || reporteConCoordenadas.latitude);
const lon = Number(reporteConCoordenadas.longitud || reporteConCoordenadas.longitude || reporteConCoordenadas.lng);

if (!isNaN(lat) && !isNaN(lon)) {
  this.mapaAdminSeguro = this.crearMapaGoogle(lat, lon);
}

}

obtenerClaseEstado(estado: any): string {
const estadoTexto = (estado || 'PENDIENTE').toString().toUpperCase();

if (estadoTexto.includes('RESUELTO')) {
  return 'estado-resuelto';
}

if (estadoTexto.includes('PROCESO')) {
  return 'estado-proceso';
}

return 'estado-pendiente';

}

obtenerTituloPanel(): string {
if (this.rolUsuario === 'bomberos') {
return 'Panel Bomberos';
}

if (this.rolUsuario === 'brigada') {
  return 'Panel Brigada Municipal';
}

return 'Panel Autoridad Municipal';

}

obtenerDescripcionPanel(): string {
if (this.rolUsuario === 'bomberos') {
return 'Reportes derivados a Bomberos para atencion en terreno.';
}

if (this.rolUsuario === 'brigada') {
  return 'Reportes derivados a Brigada Municipal para respuesta operativa.';
}

return 'Gestion, validacion y derivacion de emergencias reportadas por ciudadanos.';

}

obtenerMensajeSinReportes(): string {
if (this.rolUsuario === 'bomberos') {
return 'No hay reportes derivados a Bomberos.';
}

if (this.rolUsuario === 'brigada') {
  return 'No hay reportes derivados a Brigada Municipal.';
}

return 'No hay reportes registrados en el sistema.';

}

obtenerEmergenciasFiltradas(): any[] {
let base = this.listaEmergencias;

if (this.rolUsuario === 'bomberos') {
  base = this.listaEmergencias.filter((reporte: any) => {
    return (reporte.derivadoA || '').toString() === 'Bomberos';
  });
}

if (this.rolUsuario === 'brigada') {
  base = this.listaEmergencias.filter((reporte: any) => {
    return (reporte.derivadoA || '').toString() === 'Brigada Municipal';
  });
}

if (this.filtroAdmin === 'todos') {
  return base;
}

if (this.filtroAdmin === 'pendientes') {
  return base.filter((reporte: any) => {
    return (reporte.estado || 'PENDIENTE').toString().toUpperCase().includes('PENDIENTE');
  });
}

if (this.filtroAdmin === 'proceso') {
  return base.filter((reporte: any) => {
    return (reporte.estado || '').toString().toUpperCase().includes('PROCESO');
  });
}

if (this.filtroAdmin === 'resueltos') {
  return base.filter((reporte: any) => {
    return (reporte.estado || '').toString().toUpperCase().includes('RESUELTO');
  });
}

if (this.filtroAdmin === 'alta') {
  return base.filter((reporte: any) => {
    return (reporte.gravedad || '').toString().toUpperCase() === 'ALTA';
  });
}

return base;

}

cargarAlertasComunitarias() {
try {
const alertasGuardadas = localStorage.getItem('alertas_comunitarias');
this.listaAlertas = alertasGuardadas ? JSON.parse(alertasGuardadas) : [];
} catch (error) {
this.listaAlertas = [];
}
}

guardarAlertasComunitarias() {
localStorage.setItem('alertas_comunitarias', JSON.stringify(this.listaAlertas));
}

publicarAlertaComunitaria() {
const mensaje = (this.mensajeAlerta || '').trim();
const ruta = (this.rutaSegura || '').trim();

if (!mensaje) {
  alert('Debes escribir un mensaje de alerta.');
  return;
}

const nuevaAlerta = {
  id: Date.now(),
  mensaje: mensaje,
  zonaRiesgo: this.zonaAlerta,
  rutaSegura: ruta || 'Alejarse del sector afectado y seguir instrucciones de la autoridad.',
  fecha: new Date().toLocaleString('es-CL'),
  estado: 'ACTIVA'
};

this.listaAlertas.unshift(nuevaAlerta);
this.guardarAlertasComunitarias();

this.mensajeAlerta = '';
this.zonaAlerta = 'Media';
this.rutaSegura = '';

alert('Alerta comunitaria publicada.');

}

cerrarAlertaComunitaria(alerta: any) {
alerta.estado = 'CERRADA';
this.guardarAlertasComunitarias();
}

eliminarAlertaComunitaria(alerta: any) {
const confirmar = confirm('Deseas eliminar esta alerta comunitaria?');

if (!confirmar) {
  return;
}

this.listaAlertas = this.listaAlertas.filter((a: any) => a.id !== alerta.id);
this.guardarAlertasComunitarias();

}

cerrarSesion() {
localStorage.removeItem('rol_usuario');
localStorage.removeItem('nombre_usuario');
localStorage.removeItem('nombreUsuario');
localStorage.removeItem('usuario_nombre');
localStorage.removeItem('user_name');
localStorage.removeItem('nombre');
localStorage.removeItem('admin_rut');

this.rolUsuario = 'ciudadano';
this.nombreUsuario = '';
this.router.navigateByUrl('/login');

}

derivarReporte(reporte: any, destino: string) {
const id = reporte.id || reporte._id;

if (!id) {
  alert('No se encontro el ID del reporte.');
  return;
}

const hayDestino = destino && destino.trim() !== '';

const actualizado = {
  ...reporte,
  derivadoA: hayDestino ? destino : 'Sin derivar',
  responsable: hayDestino ? 'Pendiente' : '',
  fechaDerivacion: hayDestino ? new Date().toLocaleString('es-CL') : ''
};

this.actualizarReporteLocal(actualizado);

this.listaEmergencias = this.listaEmergencias.map((item: any) => {
  const itemId = item.id || item._id;

  if (itemId === id) {
    return actualizado;
  }

  return item;
});

this.misReportes = this.misReportes.map((item: any) => {
  const itemId = item.id || item._id;

  if (itemId === id) {
    return actualizado;
  }

  return item;
});

if (id.toString().startsWith('local-')) {
  alert('Reporte derivado a ' + actualizado.derivadoA + '.');
  return;
}

this.servicio.updateEmergencia(id, actualizado).subscribe({
  next: () => {
    alert('Reporte derivado a ' + actualizado.derivadoA + '.');
  },
  error: (err) => {
    console.error('Error derivando reporte:', err);
    alert('No respondio el servidor. La derivacion quedo registrada localmente.');
  }
});

}

verEnMapa(reporte: any) {
const latitud = reporte.latitud || reporte.latitude || '';
const longitud = reporte.longitud || reporte.longitude || reporte.lng || '';
const ubicacion = reporte.ubicacion || '';

let urlMapa = '';

if (latitud && longitud) {
  urlMapa = 'https://www.google.com/maps/search/?api=1&query=' + latitud + ',' + longitud;
} else if (ubicacion) {
  urlMapa = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ubicacion);
} else {
  alert('Este reporte no tiene ubicacion registrada.');
  return;
}

window.open(urlMapa, '_blank');

}

cambiarEstado(reporte: any, estado: string) {
const id = reporte.id || reporte._id;

if (!id) {
  alert('No se encontro el ID del reporte.');
  return;
}

let responsableActual = reporte.responsable || 'Pendiente';

if (estado === 'EN PROCESO') {
  if (this.rolUsuario === 'bomberos') {
    responsableActual = 'Bomberos';
  }

  if (this.rolUsuario === 'brigada') {
    responsableActual = 'Brigada Municipal';
  }

  if (this.rolUsuario === 'admin' && (!reporte.responsable || reporte.responsable === 'Pendiente')) {
    responsableActual = 'Autoridad Municipal';
  }
}

const actualizado = {
  ...reporte,
  estado: estado,
  responsable: responsableActual,
  fechaActualizacion: new Date().toLocaleString('es-CL')
};

if (id.toString().startsWith('local-')) {
  this.actualizarReporteLocal(actualizado);

  this.listaEmergencias = this.listaEmergencias.map((item: any) => {
    const itemId = item.id || item._id;

    if (itemId === id) {
      return actualizado;
    }

    return item;
  });

  alert('Estado actualizado a ' + estado + '.');
  this.cargarTodasLasEmergencias();
  return;
}

this.servicio.updateEmergencia(id, actualizado).subscribe({
  next: () => {
    alert('Estado actualizado a ' + estado + '.');
    this.cargarTodasLasEmergencias();
  },
  error: (err) => {
    console.error('Error actualizando estado:', err);

    this.actualizarReporteLocal(actualizado);

    this.listaEmergencias = this.listaEmergencias.map((item: any) => {
      const itemId = item.id || item._id;

      if (itemId === id) {
        return actualizado;
      }

      return item;
    });

    alert('No respondio el servidor. El estado se actualizo localmente.');
    this.cargarTodasLasEmergencias();
  }
});

}

}