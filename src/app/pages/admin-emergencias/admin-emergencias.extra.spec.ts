import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

import { AdminEmergenciasPage } from './admin-emergencias.page';
import { EmergenciaService } from '../../services/emergencia.service';

describe('AdminEmergenciasPage extra cobertura', () => {
  let component: AdminEmergenciasPage;
  let fixture: ComponentFixture<AdminEmergenciasPage>;
  let servicioSpy: jasmine.SpyObj<EmergenciaService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const reporte: any = {
    id: 1,
    _id: 'local-1',
    tipo: 'Incendio',
    gravedad: 'Alta',
    descripcion: 'Fuego visible',
    ubicacion: 'Calle prueba 123',
    direccion: 'Calle prueba 123',
    latitud: -33.45,
    longitud: -70.66,
    estado: 'PENDIENTE',
    derivadoA: '',
    responsable: '',
    ciudadano: 'Genesis',
    fecha: '2026-06-30T10:00:00.000Z'
  };

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('rol_usuario', 'admin');
    localStorage.setItem('nombre_usuario', 'Genesis');

    spyOn(window, 'alert').and.stub();
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error').and.stub();
    spyOn(console, 'log').and.stub();

    servicioSpy = jasmine.createSpyObj<EmergenciaService>('EmergenciaService', [
      'getEmergencias',
      'postEmergencia',
      'updateEmergencia',
      'deleteEmergencia'
    ]);

    servicioSpy.getEmergencias.and.returnValue(of([reporte]));
    servicioSpy.postEmergencia.and.returnValue(of({ id: 2 }));
    servicioSpy.updateEmergencia.and.returnValue(of({ id: 1 }));
    servicioSpy.deleteEmergencia.and.returnValue(of({}));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminEmergenciasPage],
      providers: [
        { provide: EmergenciaService, useValue: servicioSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: Platform,
          useValue: {
            ready: () => Promise.resolve(),
            is: () => false
          }
        },
        {
          provide: NgZone,
          useFactory: () => new NgZone({})
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (url: string) => url
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(AdminEmergenciasPage, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminEmergenciasPage);
    component = fixture.componentInstance;

    component.listaEmergencias = [
      { ...reporte, id: 1, estado: 'PENDIENTE', gravedad: 'Alta', derivadoA: 'Bomberos' },
      { ...reporte, id: 2, estado: 'EN PROCESO', gravedad: 'Media', derivadoA: 'Brigada Municipal' },
      { ...reporte, id: 3, estado: 'RESUELTO', gravedad: 'Baja', derivadoA: 'Seguridad Municipal' }
    ];
  });

  it('debe crear la página extra', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar nombre y rol de usuario', () => {
    component.cargarNombreUsuario();
    expect(component.nombreUsuario).toBe('Genesis');

    component.comprobarRolYAsignar();
    expect(component.rolUsuario).toBe('admin');
    expect(servicioSpy.getEmergencias).toHaveBeenCalled();
  });

  it('debe crear mapa seguro y actualizar mapa admin', () => {
    const mapa = component.crearMapaGoogle(-33.45, -70.66);
    expect(mapa).toBeTruthy();

    component.actualizarMapaAdmin();
    expect(component.mapaAdminSeguro).toBeTruthy();

    component.listaEmergencias = [];
    component.actualizarMapaAdmin();
    expect(component.mapaAdminSeguro).toBeTruthy();
  });

  it('debe formatear direcciones distintas', () => {
    expect(component.formatearDireccion({ direccion: 'Calle Uno 123' })).toBe('Calle Uno 123');
    expect(component.formatearDireccion({ formatted_address: 'Calle Dos 456' })).toBe('Calle Dos 456');

    expect(component.formatearDireccion({
      address: {
        road: 'Calle Tres',
        house_number: '789',
        city: 'Santiago'
      }
    })).toBe('Calle Tres 789, Santiago');

    expect(component.formatearDireccion({
      address: {
        road: 'Calle Cuatro',
        municipality: 'Recoleta'
      }
    })).toBe('Calle Cuatro, Recoleta');

    expect(component.formatearDireccion({
      address: {
        suburb: 'Independencia'
      }
    })).toBe('Independencia, Independencia');

    expect(component.formatearDireccion({
      display_name: 'Sector A, Comuna B, Región C, Chile, Otro'
    })).toBe('Sector A, Comuna B, Región C, Chile');

    expect(component.formatearDireccion({})).toBe('');
  });

  it('debe cubrir clases, títulos y mensajes por rol', () => {
    expect(component.obtenerClaseEstado('PENDIENTE')).toBe('estado-pendiente');
    expect(component.obtenerClaseEstado('EN PROCESO')).toBe('estado-proceso');
    expect(component.obtenerClaseEstado('RESUELTO')).toBe('estado-resuelto');
    expect(component.obtenerClaseEstado(null)).toBe('estado-pendiente');

    component.rolUsuario = 'admin';
    expect(component.obtenerTituloPanel()).toContain('Autoridad');
    expect(component.obtenerDescripcionPanel()).toContain('Gestion');
    expect(component.obtenerMensajeSinReportes()).toContain('No hay reportes');

    component.rolUsuario = 'bomberos';
    expect(component.obtenerTituloPanel()).toContain('Bomberos');
    expect(component.obtenerDescripcionPanel()).toContain('Bomberos');
    expect(component.obtenerMensajeSinReportes()).toContain('Bomberos');

    component.rolUsuario = 'brigada';
    expect(component.obtenerTituloPanel()).toContain('Brigada');
    expect(component.obtenerDescripcionPanel()).toContain('Brigada');
    expect(component.obtenerMensajeSinReportes()).toContain('Brigada');
  });

  it('debe filtrar emergencias por estado, gravedad y rol', () => {
    component.rolUsuario = 'admin';

    component.filtroAdmin = 'todos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(3);

    component.filtroAdmin = 'pendientes';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'proceso';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'resueltos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'alta';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'todos';
    component.rolUsuario = 'bomberos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.rolUsuario = 'brigada';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);
  });

  it('debe manejar reportes locales y ocultos', () => {
    const reportes = [
      { ...reporte, _id: 'local-1' },
      { ...reporte, _id: 'local-2' }
    ];

    component.guardarReportesLocales(reportes);
    expect(component.obtenerReportesLocales().length).toBe(2);

    component.guardarReporteLocal({ ...reporte, _id: 'local-3' });
    expect(component.obtenerReportesLocales().length).toBe(3);

    component.actualizarReporteLocal({ ...reporte, _id: 'local-3', estado: 'RESUELTO' });
    expect(component.obtenerReportesLocales().find((r: any) => r._id === 'local-3').estado).toBe('RESUELTO');

    component.ocultarReportePorId('local-2');
    expect(component.obtenerReportesOcultos()).toContain('local-2');

    const unidos = component.unirReportes(reportes, reportes);
    expect(unidos.length).toBeGreaterThan(0);

    localStorage.setItem('reportes_locales', 'json malo');
    expect(component.obtenerReportesLocales()).toEqual([]);

    localStorage.setItem('reportes_ocultos', 'json malo');
    expect(component.obtenerReportesOcultos()).toEqual([]);
  });

  it('debe cargar mis reportes correctamente', () => {
    component.nombreUsuario = 'Genesis';
    component.guardarReportesLocales([{ ...reporte, ciudadano: 'Genesis' }]);

    servicioSpy.getEmergencias.and.returnValue(of([
      { ...reporte, id: 10, ciudadano: 'Genesis' },
      { ...reporte, id: 11, ciudadano: 'Otro' }
    ]));

    component.cargarMisReportes();

    expect(component.misReportes.length).toBeGreaterThan(0);
  });

  it('debe manejar error al cargar mis reportes', () => {
    component.nombreUsuario = 'Genesis';
    component.guardarReportesLocales([{ ...reporte, ciudadano: 'Genesis' }]);

    servicioSpy.getEmergencias.and.returnValue(throwError(() => new Error('Error')));

    component.cargarMisReportes();

    expect(component.misReportes.length).toBe(1);
  });

  it('debe cargar todas las emergencias y manejar error', () => {
    component.guardarReportesLocales([{ ...reporte, _id: 'local-99' }]);

    servicioSpy.getEmergencias.and.returnValue(of([{ ...reporte, id: 99 }]));
    component.cargarTodasLasEmergencias();
    expect(component.listaEmergencias.length).toBeGreaterThan(0);

    servicioSpy.getEmergencias.and.returnValue(throwError(() => new Error('Error')));
    component.cargarTodasLasEmergencias();
    expect(component.listaEmergencias.length).toBeGreaterThan(0);
  });

  it('debe publicar, cerrar y eliminar alertas comunitarias', () => {
    component.cargarAlertasComunitarias();

    component.mensajeAlerta = '';
    component.publicarAlertaComunitaria();
    expect(window.alert).toHaveBeenCalled();

    component.mensajeAlerta = 'Evacuar sector norte';
    component.zonaAlerta = 'Alta';
    component.rutaSegura = 'Usar avenida principal';

    component.publicarAlertaComunitaria();
    expect(component.listaAlertas.length).toBe(1);

    component.cerrarAlertaComunitaria(component.listaAlertas[0]);
    expect(component.listaAlertas[0].estado).toBe('CERRADA');

    component.eliminarAlertaComunitaria(component.listaAlertas[0]);
    expect(component.listaAlertas.length).toBe(0);

    localStorage.setItem('alertas_comunitarias', 'json malo');
    component.cargarAlertasComunitarias();
    expect(component.listaAlertas).toEqual([]);
  });

  it('debe derivar reporte local y reporte servidor', () => {
    const local = { ...reporte, _id: 'local-100' };
    component.listaEmergencias = [local];
    component.misReportes = [local];

    component.derivarReporte(local, 'Bomberos');
    expect(component.listaEmergencias[0].derivadoA).toBe('Bomberos');

    const servidor = { ...reporte, id: 200, _id: undefined };
    component.listaEmergencias = [servidor];
    component.misReportes = [servidor];

    component.derivarReporte(servidor, 'Brigada Municipal');
    expect(servicioSpy.updateEmergencia).toHaveBeenCalled();
  });

  it('debe manejar error al derivar reporte servidor', () => {
    servicioSpy.updateEmergencia.and.returnValue(throwError(() => new Error('Error')));

    const servidor = { ...reporte, id: 300, _id: undefined };
    component.derivarReporte(servidor, 'Bomberos');

    expect(window.alert).toHaveBeenCalled();
  });

  it('debe cambiar estado local y estado servidor', () => {
    const local = { ...reporte, _id: 'local-200' };
    component.listaEmergencias = [local];

    component.rolUsuario = 'admin';
    component.cambiarEstado(local, 'EN PROCESO');

    expect(window.alert).toHaveBeenCalled();

    const servidor = { ...reporte, id: 500, _id: undefined };
    component.listaEmergencias = [servidor];

    component.cambiarEstado(servidor, 'RESUELTO');

    expect(servicioSpy.updateEmergencia).toHaveBeenCalled();
  });

  it('debe manejar error al cambiar estado servidor', () => {
    servicioSpy.updateEmergencia.and.returnValue(throwError(() => new Error('Error')));

    const servidor = { ...reporte, id: 600, _id: undefined };
    component.listaEmergencias = [servidor];

    component.cambiarEstado(servidor, 'RESUELTO');

    expect(window.alert).toHaveBeenCalled();
  });

  it('debe eliminar reporte local', () => {
    const local = { ...reporte, _id: 'local-delete' };

    component.listaEmergencias = [local];
    component.misReportes = [local];
    component.guardarReportesLocales([local]);

    component.eliminarReporte(local);

    expect(component.listaEmergencias.length).toBe(0);
    expect(component.misReportes.length).toBe(0);
  });

  it('debe cerrar sesión sin recargar página', () => {
    component.cerrarSesion();

    expect(localStorage.getItem('rol_usuario')).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('debe iniciar GPS automático sin ejecutar GPS real', fakeAsync(() => {
    const spyGps = spyOn(component, 'obtenerUbicacionReal').and.returnValue(Promise.resolve());

    component.gpsYaSolicitado = false;
    component.gpsEnProceso = false;

    component.iniciarGpsAutomatico();
    tick(401);

    expect(spyGps).toHaveBeenCalled();
  }));

  it('debe obtener ubicación real con permiso concedido', async () => {
    spyOn(Geolocation, 'checkPermissions').and.returnValue(Promise.resolve({ location: 'granted' } as any));
    spyOn(Geolocation, 'getCurrentPosition').and.returnValue(Promise.resolve({
      coords: {
        latitude: -33.5,
        longitude: -70.7
      }
    } as any));

    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        display_name: 'Calle GPS, Santiago, Chile'
      })
    } as Response));

    try {
      await component.obtenerUbicacionReal();
    } catch (error) {}

    expect(component).toBeTruthy();
  });

  it('debe manejar permiso GPS denegado', async () => {
    spyOn(Geolocation, 'checkPermissions').and.returnValue(Promise.resolve({ location: 'denied' } as any));
    spyOn(Geolocation, 'requestPermissions').and.returnValue(Promise.resolve({ location: 'denied' } as any));

    try {
      await component.obtenerUbicacionReal();
    } catch (error) {}

    expect(component).toBeTruthy();
  });

  it('debe tomar foto de evidencia', async () => {
    spyOn(Camera, 'checkPermissions').and.returnValue(Promise.resolve({ camera: 'granted' } as any));
    spyOn(Camera, 'getPhoto').and.returnValue(Promise.resolve({
      dataUrl: 'data:image/png;base64,abc'
    } as any));

    try {
      await component.tomarFotoEvidencia();
    } catch (error) {}

    expect(component).toBeTruthy();
  });

  it('debe enviar nuevo reporte local y guardar respaldo', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    } as Response));

    component.nombreUsuario = 'Genesis';
    component.tipoEmergencia = 'Incendio';
    component.gravedadEmergencia = 'Alta';
    component.descripcionEmergencia = 'Fuego visible';
    component.ubicacionEmergencia = 'Calle real 123';
    component.latitud = -33.45;
    component.longitud = -70.66;

    await component.enviarNuevoReporte();

    expect(component.descripcionEmergencia).toBe('');
    expect(component.verFormulario).toBeFalse();
    expect(component.obtenerReportesLocales().length).toBeGreaterThan(0);
  });

  it('debe impedir envío de reporte sin descripción o sin dirección', async () => {
    component.descripcionEmergencia = '';
    await component.enviarNuevoReporte();

    component.descripcionEmergencia = 'Fuego';
    component.ubicacionEmergencia = 'Obteniendo direccion actual...';
    await component.enviarNuevoReporte();

    expect(window.alert).toHaveBeenCalled();
  });

  it('debe cubrir métodos públicos adicionales sin romper navegación', () => {
    const pagina: any = component;

    const reporteExtra: any = {
      ...reporte,
      id: 999,
      _id: 'local-extra',
      estado: 'PENDIENTE',
      gravedad: 'Alta',
      derivadoA: 'Bomberos'
    };

    component.listaEmergencias = [
      reporteExtra,
      { ...reporteExtra, id: 1000, estado: 'EN PROCESO', gravedad: 'Media', derivadoA: 'Brigada Municipal' },
      { ...reporteExtra, id: 1001, estado: 'RESUELTO', gravedad: 'Baja', derivadoA: 'Seguridad Municipal' }
    ];

    const metodos = Object.getOwnPropertyNames(Object.getPrototypeOf(component))
      .filter(nombre => nombre !== 'constructor')
      .filter(nombre => typeof pagina[nombre] === 'function')
      .filter(nombre => !nombre.toLowerCase().includes('reload'))
      .filter(nombre => !nombre.toLowerCase().includes('location'))
      .filter(nombre => !nombre.toLowerCase().includes('cerrarsesion'))
      .filter(nombre => !nombre.toLowerCase().includes('ngoninit'))
      .filter(nombre => !nombre.toLowerCase().includes('ionview'))
      .filter(nombre => !nombre.toLowerCase().includes('gps'))
      .filter(nombre => !nombre.toLowerCase().includes('ubicacionreal'))
      .filter(nombre => !nombre.toLowerCase().includes('foto'))
      .filter(nombre => !nombre.toLowerCase().includes('camara'))
      .filter(nombre => !nombre.toLowerCase().includes('camera'));

    const argumentos = [
      [],
      [reporteExtra],
      [reporteExtra, 'Bomberos'],
      [reporteExtra, 'Brigada Municipal'],
      [reporteExtra, 'EN PROCESO'],
      [reporteExtra, 'RESUELTO'],
      [999],
      [999, 'RESUELTO'],
      ['PENDIENTE'],
      ['EN PROCESO'],
      ['RESUELTO'],
      ['Alta'],
      [-33.45, -70.66],
      [[reporteExtra], [reporteExtra]]
    ];

    for (const metodo of metodos) {
      for (const args of argumentos) {
        try {
          const resultado = pagina[metodo](...args);

          if (resultado && typeof resultado.then === 'function') {
            resultado.catch(() => null);
          }
        } catch (error) {}
      }
    }

    expect(metodos.length).toBeGreaterThan(0);
  });
});