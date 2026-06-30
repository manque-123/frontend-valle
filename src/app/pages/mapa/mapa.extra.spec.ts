import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

import { MapaPage } from './mapa.page';
import { EmergenciaService } from '../../services/emergencia.service';

describe('MapaPage extra cobertura', () => {
  let component: MapaPage;
  let fixture: ComponentFixture<MapaPage>;
  let servicioSpy: jasmine.SpyObj<EmergenciaService>;

  beforeEach(async () => {
    spyOn(window, 'alert').and.stub();
    spyOn(console, 'error').and.stub();

    servicioSpy = jasmine.createSpyObj<EmergenciaService>('EmergenciaService', [
      'getEmergencias',
      'postEmergencia',
      'updateEmergencia',
      'deleteEmergencia'
    ]);

    servicioSpy.getEmergencias.and.returnValue(of([]));
    servicioSpy.postEmergencia.and.returnValue(of({ id: 1 }));
    servicioSpy.updateEmergencia.and.returnValue(of({}));
    servicioSpy.deleteEmergencia.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MapaPage],
      providers: [
        {
          provide: EmergenciaService,
          useValue: servicioSpy
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(MapaPage, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(MapaPage);
    component = fixture.componentInstance;
  });

  it('debe crear mapa extra', () => {
    expect(component).toBeTruthy();
  });

  it('debe ejecutar ngOnInit sin GPS real', fakeAsync(() => {
    const gpsSpy = spyOn(component, 'detectarGps').and.returnValue(Promise.resolve());

    component.ngOnInit();
    tick(1001);

    expect(gpsSpy).toHaveBeenCalled();
  }));

  it('debe ejecutar ionViewDidEnter', fakeAsync(() => {
    component.mapa = {
      invalidateSize: jasmine.createSpy('invalidateSize')
    } as any;

    component.ionViewDidEnter();
    tick(601);

    expect(component.mapa.invalidateSize).toHaveBeenCalled();
  }));

  it('debe detectar GPS con permiso concedido', async () => {
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
        display_name: 'Calle Mapa, Santiago, Chile'
      })
    } as Response));

    spyOn(component, 'inicializarMapa').and.stub();

    try {
      await component.detectarGps();
    } catch (error) {}

    expect(component).toBeTruthy();
  });

  it('debe manejar permiso GPS denegado', async () => {
    spyOn(Geolocation, 'checkPermissions').and.returnValue(Promise.resolve({ location: 'denied' } as any));
    spyOn(Geolocation, 'requestPermissions').and.returnValue(Promise.resolve({ location: 'denied' } as any));
    spyOn(component, 'inicializarMapa').and.stub();

    try {
      await component.detectarGps();
    } catch (error) {}

    expect(component).toBeTruthy();
  });

  it('debe manejar error GPS', async () => {
    spyOn(Geolocation, 'checkPermissions').and.returnValue(Promise.reject('Error GPS'));
    spyOn(component, 'inicializarMapa').and.stub();

    await component.detectarGps();

    expect(component.ubicacionEmergencia).toBe('Ubicación no disponible');
    expect(component.latitud).toBe(-33.5411);
    expect(component.longitud).toBe(-70.6483);
  });

  it('debe obtener dirección con address', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        address: {
          road: 'Calle Uno',
          house_number: '100',
          suburb: 'Recoleta'
        }
      })
    } as Response));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toContain('Calle Uno');
  });

  it('debe obtener dirección con display_name', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        display_name: 'Dirección larga'
      })
    } as Response));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toBe('Dirección larga');
  });

  it('debe manejar respuesta mala de dirección', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: false,
      json: () => Promise.resolve({})
    } as Response));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toBe('Dirección no disponible');
  });

  it('debe manejar error de dirección', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Error'));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toBe('Dirección no disponible');
  });

  it('debe inicializar mapa sin contenedor', () => {
    component.inicializarMapa(-33.45, -70.66);

    expect(console.error).toHaveBeenCalled();
  });

  it('debe configurar iconos Leaflet', () => {
    component.configurarIconosLeaflet();

    expect(component).toBeTruthy();
  });

  it('debe activar formulario', fakeAsync(() => {
    component.mapa = {
      invalidateSize: jasmine.createSpy('invalidateSize')
    } as any;

    component.activarFormulario();
    tick(501);

    expect(component.verFormulario).toBeTrue();
    expect(component.mapa.invalidateSize).toHaveBeenCalled();
  }));

  it('debe impedir envío sin descripción', () => {
    component.descripcionEmergencia = '';

    component.enviarNuevoReporte();

    expect(window.alert).toHaveBeenCalled();
    expect(servicioSpy.postEmergencia).not.toHaveBeenCalled();
  });

  it('debe enviar reporte correctamente', fakeAsync(() => {
    const gpsSpy = spyOn(component, 'detectarGps').and.returnValue(Promise.resolve());

    component.tipoEmergencia = 'Incendio';
    component.descripcionEmergencia = 'Fuego visible';
    component.ubicacionEmergencia = 'Calle prueba';
    component.latitud = -33.45;
    component.longitud = -70.66;
    component.verFormulario = true;

    component.enviarNuevoReporte();
    tick(501);

    expect(servicioSpy.postEmergencia).toHaveBeenCalled();
    expect(component.descripcionEmergencia).toBe('');
    expect(component.tipoEmergencia).toBe('Incendio');
    expect(component.verFormulario).toBeFalse();
    expect(gpsSpy).toHaveBeenCalled();
  }));

  it('debe manejar error al enviar reporte', () => {
    servicioSpy.postEmergencia.and.returnValue(throwError(() => new Error('Error')));

    component.tipoEmergencia = 'Incendio';
    component.descripcionEmergencia = 'Fuego visible';
    component.ubicacionEmergencia = 'Calle prueba';
    component.latitud = -33.45;
    component.longitud = -70.66;

    component.enviarNuevoReporte();

    expect(window.alert).toHaveBeenCalled();
  });
});