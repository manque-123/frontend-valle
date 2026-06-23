import { of } from 'rxjs';
import { AdminEmergenciasPage } from './admin-emergencias.page';

describe('AdminEmergenciasPage', () => {
let component: AdminEmergenciasPage;
let servicioMock: any;
let sanitizerMock: any;
let platformMock: any;
let zoneMock: any;
let routerMock: any;

beforeEach(() => {
localStorage.clear();

servicioMock = {
  getEmergencias: jasmine.createSpy('getEmergencias').and.returnValue(of([])),
  updateEmergencia: jasmine.createSpy('updateEmergencia').and.returnValue(of({}))
};

sanitizerMock = {
  bypassSecurityTrustResourceUrl: (url: string) => url
};

platformMock = {
  ready: () => Promise.resolve()
};

zoneMock = {
  run: (fn: any) => fn()
};

routerMock = {
  navigateByUrl: jasmine.createSpy('navigateByUrl')
};

component = new AdminEmergenciasPage(
  servicioMock,
  sanitizerMock,
  platformMock,
  zoneMock,
  routerMock
);

});

it('debe crear el componente admin emergencias', () => {
expect(component).toBeTruthy();
});

it('debe crear un mapa seguro de Google', () => {
const mapa = component.crearMapaGoogle(-33.5, -70.6);

expect(mapa).toContain('https://maps.google.com/maps?q=-33.5,-70.6');

});

it('debe asignar mensaje de ubicacion', () => {
component.setMensaje('Direccion de prueba');

expect(component.ubicacionEmergencia).toBe('Direccion de prueba');

});

it('debe mostrar titulo de Autoridad Municipal por defecto', () => {
component.rolUsuario = 'admin';

expect(component.obtenerTituloPanel()).toBe('Panel Autoridad Municipal');

});

it('debe mostrar titulo de Bomberos', () => {
component.rolUsuario = 'bomberos';

expect(component.obtenerTituloPanel()).toBe('Panel Bomberos');

});

it('debe mostrar titulo de Brigada Municipal', () => {
component.rolUsuario = 'brigada';

expect(component.obtenerTituloPanel()).toBe('Panel Brigada Municipal');

});

it('debe mostrar descripcion de Bomberos', () => {
component.rolUsuario = 'bomberos';

expect(component.obtenerDescripcionPanel()).toContain('Bomberos');

});

it('debe mostrar descripcion de Brigada Municipal', () => {
component.rolUsuario = 'brigada';

expect(component.obtenerDescripcionPanel()).toContain('Brigada Municipal');

});

it('debe mostrar mensaje sin reportes para Bomberos', () => {
component.rolUsuario = 'bomberos';

expect(component.obtenerMensajeSinReportes()).toContain('Bomberos');

});

it('debe mostrar mensaje sin reportes para Brigada Municipal', () => {
component.rolUsuario = 'brigada';

expect(component.obtenerMensajeSinReportes()).toContain('Brigada Municipal');

});

it('debe retornar clase estado resuelto', () => {
expect(component.obtenerClaseEstado('RESUELTO')).toBe('estado-resuelto');
});

it('debe retornar clase estado proceso', () => {
expect(component.obtenerClaseEstado('EN PROCESO')).toBe('estado-proceso');
});

it('debe retornar clase estado pendiente', () => {
expect(component.obtenerClaseEstado('PENDIENTE')).toBe('estado-pendiente');
});

it('debe publicar una alerta comunitaria', () => {
spyOn(window, 'alert');

component.mensajeAlerta = 'Emergencia activa en el sector.';
component.zonaAlerta = 'Alta';
component.rutaSegura = 'Dirigirse a zona segura.';

component.publicarAlertaComunitaria();

expect(component.listaAlertas.length).toBe(1);
expect(component.listaAlertas[0].mensaje).toBe('Emergencia activa en el sector.');
expect(component.listaAlertas[0].estado).toBe('ACTIVA');
expect(component.listaAlertas[0].zonaRiesgo).toBe('Alta');

});

it('no debe publicar alerta sin mensaje', () => {
spyOn(window, 'alert');

component.mensajeAlerta = '';

component.publicarAlertaComunitaria();

expect(component.listaAlertas.length).toBe(0);
expect(window.alert).toHaveBeenCalledWith('Debes escribir un mensaje de alerta.');

});

it('debe cerrar una alerta comunitaria', () => {
const alerta: any = {
id: 1,
mensaje: 'Alerta',
zonaRiesgo: 'Media',
rutaSegura: 'Ruta segura',
fecha: 'fecha',
estado: 'ACTIVA'
};

component.listaAlertas = [alerta];

component.cerrarAlertaComunitaria(alerta);

expect(component.listaAlertas[0].estado).toBe('CERRADA');

});

it('debe eliminar una alerta comunitaria', () => {
spyOn(window, 'confirm').and.returnValue(true);

const alerta: any = {
  id: 1,
  mensaje: 'Alerta',
  zonaRiesgo: 'Media',
  rutaSegura: 'Ruta segura',
  fecha: 'fecha',
  estado: 'ACTIVA'
};

component.listaAlertas = [alerta];

component.eliminarAlertaComunitaria(alerta);

expect(component.listaAlertas.length).toBe(0);

});

it('no debe eliminar alerta si se cancela confirmacion', () => {
spyOn(window, 'confirm').and.returnValue(false);

const alerta: any = {
  id: 1,
  mensaje: 'Alerta',
  zonaRiesgo: 'Media',
  rutaSegura: 'Ruta segura',
  fecha: 'fecha',
  estado: 'ACTIVA'
};

component.listaAlertas = [alerta];

component.eliminarAlertaComunitaria(alerta);

expect(component.listaAlertas.length).toBe(1);

});

it('debe guardar y cargar alertas comunitarias desde localStorage', () => {
const alertas = [
{
id: 1,
mensaje: 'Alerta guardada',
zonaRiesgo: 'Alta',
rutaSegura: 'Ruta segura',
fecha: 'fecha',
estado: 'ACTIVA'
}
];

localStorage.setItem('alertas_comunitarias', JSON.stringify(alertas));

component.cargarAlertasComunitarias();

expect(component.listaAlertas.length).toBe(1);
expect(component.listaAlertas[0].mensaje).toBe('Alerta guardada');

});

it('debe filtrar reportes de Bomberos', () => {
component.rolUsuario = 'bomberos';
component.filtroAdmin = 'todos';

component.listaEmergencias = [
  {
    _id: '1',
    derivadoA: 'Bomberos',
    estado: 'PENDIENTE'
  },
  {
    _id: '2',
    derivadoA: 'Brigada Municipal',
    estado: 'PENDIENTE'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].derivadoA).toBe('Bomberos');

});

it('debe filtrar reportes de Brigada Municipal', () => {
component.rolUsuario = 'brigada';
component.filtroAdmin = 'todos';

component.listaEmergencias = [
  {
    _id: '1',
    derivadoA: 'Bomberos',
    estado: 'PENDIENTE'
  },
  {
    _id: '2',
    derivadoA: 'Brigada Municipal',
    estado: 'PENDIENTE'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].derivadoA).toBe('Brigada Municipal');

});

it('debe filtrar reportes pendientes', () => {
component.rolUsuario = 'admin';
component.filtroAdmin = 'pendientes';

component.listaEmergencias = [
  {
    _id: '1',
    estado: 'PENDIENTE'
  },
  {
    _id: '2',
    estado: 'RESUELTO'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].estado).toBe('PENDIENTE');

});

it('debe filtrar reportes en proceso', () => {
component.rolUsuario = 'admin';
component.filtroAdmin = 'proceso';

component.listaEmergencias = [
  {
    _id: '1',
    estado: 'EN PROCESO'
  },
  {
    _id: '2',
    estado: 'PENDIENTE'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].estado).toBe('EN PROCESO');

});

it('debe filtrar reportes resueltos', () => {
component.rolUsuario = 'admin';
component.filtroAdmin = 'resueltos';

component.listaEmergencias = [
  {
    _id: '1',
    estado: 'RESUELTO'
  },
  {
    _id: '2',
    estado: 'PENDIENTE'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].estado).toBe('RESUELTO');

});

it('debe filtrar reportes de gravedad alta', () => {
component.rolUsuario = 'admin';
component.filtroAdmin = 'alta';

component.listaEmergencias = [
  {
    _id: '1',
    gravedad: 'Alta'
  },
  {
    _id: '2',
    gravedad: 'Media'
  }
];

const resultado = component.obtenerEmergenciasFiltradas();

expect(resultado.length).toBe(1);
expect(resultado[0].gravedad).toBe('Alta');

});

it('debe guardar reporte local', () => {
const reporte = {
_id: 'local-1',
tipo: 'Incendio',
estado: 'PENDIENTE'
};

component.guardarReporteLocal(reporte);

const guardados = JSON.parse(localStorage.getItem('reportes_locales') || '[]');

expect(guardados.length).toBe(1);
expect(guardados[0]._id).toBe('local-1');

});

it('no debe duplicar reporte local existente', () => {
const reporte = {
_id: 'local-1',
tipo: 'Incendio',
estado: 'PENDIENTE'
};

component.guardarReporteLocal(reporte);
component.guardarReporteLocal(reporte);

const guardados = JSON.parse(localStorage.getItem('reportes_locales') || '[]');

expect(guardados.length).toBe(1);

});

it('debe actualizar reporte local', () => {
const reporte = {
_id: 'local-1',
tipo: 'Incendio',
estado: 'PENDIENTE'
};

component.guardarReportesLocales([reporte]);

const actualizado = {
  _id: 'local-1',
  tipo: 'Incendio',
  estado: 'RESUELTO'
};

component.actualizarReporteLocal(actualizado);

const guardados = JSON.parse(localStorage.getItem('reportes_locales') || '[]');

expect(guardados[0].estado).toBe('RESUELTO');

});

it('debe ocultar reporte por id', () => {
component.ocultarReportePorId('local-1');

const ocultos = JSON.parse(localStorage.getItem('reportes_ocultos') || '[]');

expect(ocultos).toContain('local-1');

});

it('debe unir reportes sin duplicados', () => {
const locales = [
{
_id: '1',
fecha: '2026-06-23T10:00:00'
}
];

const servidor = [
  {
    _id: '1',
    fecha: '2026-06-23T10:00:00'
  },
  {
    _id: '2',
    fecha: '2026-06-23T11:00:00'
  }
];

const resultado = component.unirReportes(servidor, locales);

expect(resultado.length).toBe(2);
expect(resultado[0]._id).toBe('2');

});

it('debe derivar reporte local a Bomberos', () => {
spyOn(window, 'alert');

const reporte = {
  _id: 'local-1',
  tipo: 'Incendio',
  estado: 'PENDIENTE',
  derivadoA: ''
};

component.listaEmergencias = [reporte];

component.derivarReporte(reporte, 'Bomberos');

expect(component.listaEmergencias[0].derivadoA).toBe('Bomberos');
expect(component.listaEmergencias[0].responsable).toBe('Pendiente');

});

it('debe derivar reporte local a Brigada Municipal', () => {
spyOn(window, 'alert');

const reporte = {
  _id: 'local-1',
  tipo: 'Incendio',
  estado: 'PENDIENTE',
  derivadoA: ''
};

component.listaEmergencias = [reporte];

component.derivarReporte(reporte, 'Brigada Municipal');

expect(component.listaEmergencias[0].derivadoA).toBe('Brigada Municipal');
expect(component.listaEmergencias[0].responsable).toBe('Pendiente');

});

it('debe cambiar estado local a EN PROCESO como Bomberos', () => {
spyOn(window, 'alert');

component.rolUsuario = 'bomberos';

const reporte = {
  _id: 'local-1',
  tipo: 'Incendio',
  estado: 'PENDIENTE',
  responsable: 'Pendiente'
};

component.guardarReportesLocales([reporte]);
component.listaEmergencias = [reporte];

component.cambiarEstado(reporte, 'EN PROCESO');

const guardados = JSON.parse(localStorage.getItem('reportes_locales') || '[]');

expect(guardados[0].estado).toBe('EN PROCESO');
expect(guardados[0].responsable).toBe('Bomberos');

});

it('debe cambiar estado local a EN PROCESO como Brigada Municipal', () => {
spyOn(window, 'alert');

component.rolUsuario = 'brigada';

const reporte = {
  _id: 'local-2',
  tipo: 'Incendio',
  estado: 'PENDIENTE',
  responsable: 'Pendiente'
};

component.guardarReportesLocales([reporte]);
component.listaEmergencias = [reporte];

component.cambiarEstado(reporte, 'EN PROCESO');

const guardados = JSON.parse(localStorage.getItem('reportes_locales') || '[]');

expect(guardados[0].estado).toBe('EN PROCESO');
expect(guardados[0].responsable).toBe('Brigada Municipal');

});

it('debe abrir reporte en mapa con coordenadas', () => {
spyOn(window, 'open');

const reporte = {
  latitud: -33.5,
  longitud: -70.6,
  ubicacion: 'Direccion prueba'
};

component.verEnMapa(reporte);

expect(window.open).toHaveBeenCalled();

});

it('debe mostrar alerta si reporte no tiene ubicacion', () => {
spyOn(window, 'alert');

const reporte = {};

component.verEnMapa(reporte);

expect(window.alert).toHaveBeenCalledWith('Este reporte no tiene ubicacion registrada.');

});

it('debe cerrar sesion y navegar al login', () => {
localStorage.setItem('rol_usuario', 'admin');
localStorage.setItem('nombre_usuario', 'Autoridad');

component.cerrarSesion();

expect(localStorage.getItem('rol_usuario')).toBeNull();
expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');

});

});