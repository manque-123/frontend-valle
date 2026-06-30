import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdminEmergenciasPage } from './admin-emergencias.page';
import { EmergenciaService } from '../../services/emergencia.service';

describe('AdminEmergenciasPage', () => {
  let component: AdminEmergenciasPage;
  let fixture: ComponentFixture<AdminEmergenciasPage>;
  let servicioSpy: jasmine.SpyObj<EmergenciaService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('rol_usuario', 'admin');

    servicioSpy = jasmine.createSpyObj<EmergenciaService>('EmergenciaService', [
      'getEmergencias',
      'postEmergencia',
      'updateEmergencia',
      'deleteEmergencia'
    ]);

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    servicioSpy.getEmergencias.and.returnValue(of([]));
    servicioSpy.postEmergencia.and.returnValue(of({}));
    servicioSpy.updateEmergencia.and.returnValue(of({}));
    servicioSpy.deleteEmergencia.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminEmergenciasPage],
      providers: [
        {
          provide: EmergenciaService,
          useValue: servicioSpy
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: Platform,
          useValue: {
            ready: () => Promise.resolve()
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
      ]
    })
      .overrideComponent(AdminEmergenciasPage, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminEmergenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear la página', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar el nombre del usuario desde localStorage', () => {
    localStorage.setItem('nombre_usuario', 'Genesis');

    component.cargarNombreUsuario();

    expect(component.nombreUsuario).toBe('Genesis');
  });

  it('debe crear url segura de mapa', () => {
    const resultado = component.crearMapaGoogle(-33.45, -70.66);

    expect(resultado).toBeTruthy();
  });

  it('debe entregar clase según estado', () => {
    expect(component.obtenerClaseEstado('RESUELTO')).toBe('estado-resuelto');
    expect(component.obtenerClaseEstado('EN PROCESO')).toBe('estado-proceso');
    expect(component.obtenerClaseEstado('PENDIENTE')).toBe('estado-pendiente');
    expect(component.obtenerClaseEstado(null)).toBe('estado-pendiente');
  });

  it('debe entregar título según rol', () => {
    component.rolUsuario = 'bomberos';
    expect(component.obtenerTituloPanel()).toBe('Panel Bomberos');

    component.rolUsuario = 'brigada';
    expect(component.obtenerTituloPanel()).toBe('Panel Brigada Municipal');

    component.rolUsuario = 'admin';
    expect(component.obtenerTituloPanel()).toBe('Panel Autoridad Municipal');
  });

  it('debe entregar descripción según rol', () => {
    component.rolUsuario = 'bomberos';
    expect(component.obtenerDescripcionPanel()).toContain('Bomberos');

    component.rolUsuario = 'brigada';
    expect(component.obtenerDescripcionPanel()).toContain('Brigada Municipal');

    component.rolUsuario = 'admin';
    expect(component.obtenerDescripcionPanel()).toContain('Gestion');
  });

  it('debe entregar mensaje sin reportes según rol', () => {
    component.rolUsuario = 'bomberos';
    expect(component.obtenerMensajeSinReportes()).toContain('Bomberos');

    component.rolUsuario = 'brigada';
    expect(component.obtenerMensajeSinReportes()).toContain('Brigada Municipal');

    component.rolUsuario = 'admin';
    expect(component.obtenerMensajeSinReportes()).toContain('No hay reportes');
  });

  it('debe formatear dirección desde distintos formatos', () => {
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
      display_name: 'Sector A, Comuna B, Región C, Chile, Extra'
    })).toBe('Sector A, Comuna B, Región C, Chile');
  });

  it('debe manejar reportes locales', () => {
    const reportes = [
      {
        _id: 'local-1',
        descripcion: 'Reporte local'
      }
    ];

    component.guardarReportesLocales(reportes);

    expect(component.obtenerReportesLocales()).toEqual(reportes);
  });

  it('debe retornar lista vacía si localStorage tiene JSON inválido', () => {
    localStorage.setItem('reportes_locales', 'texto malo');

    expect(component.obtenerReportesLocales()).toEqual([]);
  });

  it('debe guardar reporte local sin duplicar', () => {
    const reporte = {
      _id: 'local-1',
      descripcion: 'Fuego cercano',
      fecha: '2026-06-30T10:00:00.000Z'
    };

    component.guardarReporteLocal(reporte);
    component.guardarReporteLocal(reporte);

    expect(component.obtenerReportesLocales().length).toBe(1);
  });

  it('debe unir reportes y ocultar duplicados', () => {
    localStorage.setItem('reportes_ocultos', JSON.stringify(['2']));

    const servidor = [
      {
        id: '1',
        descripcion: 'Servidor',
        fecha: '2026-06-30T10:00:00.000Z'
      },
      {
        id: '2',
        descripcion: 'Oculto',
        fecha: '2026-06-30T11:00:00.000Z'
      }
    ];

    const locales = [
      {
        id: '1',
        descripcion: 'Duplicado',
        fecha: '2026-06-30T12:00:00.000Z'
      }
    ];

    const resultado = component.unirReportes(servidor, locales);

    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe('1');
  });

  it('debe filtrar emergencias por estado y gravedad', () => {
    component.listaEmergencias = [
      {
        id: 1,
        estado: 'PENDIENTE',
        gravedad: 'Alta'
      },
      {
        id: 2,
        estado: 'EN PROCESO',
        gravedad: 'Media'
      },
      {
        id: 3,
        estado: 'RESUELTO',
        gravedad: 'Baja'
      }
    ];

    component.filtroAdmin = 'pendientes';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'proceso';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'resueltos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'alta';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.filtroAdmin = 'todos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(3);
  });

  it('debe filtrar reportes derivados según rol', () => {
    component.listaEmergencias = [
      {
        id: 1,
        derivadoA: 'Bomberos'
      },
      {
        id: 2,
        derivadoA: 'Brigada Municipal'
      },
      {
        id: 3,
        derivadoA: 'Seguridad Municipal'
      }
    ];

    component.rolUsuario = 'bomberos';
    component.filtroAdmin = 'todos';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);

    component.rolUsuario = 'brigada';
    expect(component.obtenerEmergenciasFiltradas().length).toBe(1);
  });

  it('debe cargar todas las emergencias correctamente', () => {
    const datos = [
      {
        id: 1,
        descripcion: 'Emergencia servidor',
        latitud: -33.45,
        longitud: -70.66
      }
    ];

    servicioSpy.getEmergencias.and.returnValue(of(datos));

    component.cargarTodasLasEmergencias();

    expect(component.listaEmergencias.length).toBe(1);
    expect(servicioSpy.getEmergencias).toHaveBeenCalled();
  });

  it('debe manejar error al cargar emergencias', () => {
    servicioSpy.getEmergencias.and.returnValue(throwError(() => new Error('Error')));

    component.cargarTodasLasEmergencias();

    expect(component.listaEmergencias).toEqual([]);
  });

  it('debe publicar alerta comunitaria', () => {
    const alertSpy = spyOn(window, 'alert');

    component.mensajeAlerta = 'Evacuar sector';
    component.zonaAlerta = 'Alta';
    component.rutaSegura = 'Ir hacia avenida principal';

    component.publicarAlertaComunitaria();

    expect(component.listaAlertas.length).toBe(1);
    expect(component.mensajeAlerta).toBe('');
    expect(alertSpy).toHaveBeenCalled();
  });

  it('debe impedir publicar alerta vacía', () => {
    const alertSpy = spyOn(window, 'alert');

    component.mensajeAlerta = '';

    component.publicarAlertaComunitaria();

    expect(alertSpy).toHaveBeenCalled();
  });

  it('debe cerrar una alerta comunitaria', () => {
    const alerta = {
      id: 1,
      estado: 'ACTIVA'
    };

    component.cerrarAlertaComunitaria(alerta);

    expect(alerta.estado).toBe('CERRADA');
  });

  it('debe eliminar una alerta comunitaria', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    const alerta = {
      id: 1,
      estado: 'ACTIVA'
    };

    component.listaAlertas = [alerta];

    component.eliminarAlertaComunitaria(alerta);

    expect(component.listaAlertas.length).toBe(0);
  });

  it('debe derivar reporte local', () => {
    const alertSpy = spyOn(window, 'alert');

    const reporte = {
      _id: 'local-1',
      descripcion: 'Reporte local'
    };

    component.listaEmergencias = [reporte];

    component.derivarReporte(reporte, 'Bomberos');

    expect(component.listaEmergencias[0].derivadoA).toBe('Bomberos');
    expect(alertSpy).toHaveBeenCalled();
  });

  it('debe cambiar estado de reporte local', () => {
    const alertSpy = spyOn(window, 'alert');

    const reporte = {
      _id: 'local-2',
      estado: 'PENDIENTE'
    };

    component.listaEmergencias = [reporte];

    component.cambiarEstado(reporte, 'EN PROCESO');

    expect(alertSpy).toHaveBeenCalled();
  });

  it('debe cerrar sesión', () => {
    localStorage.setItem('rol_usuario', 'admin');
    localStorage.setItem('nombre_usuario', 'Genesis');

    component.cerrarSesion();

    expect(localStorage.getItem('rol_usuario')).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});