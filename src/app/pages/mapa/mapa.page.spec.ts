import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MapaPage } from './mapa.page';
import { EmergenciaService } from '../../services/emergencia.service';

describe('MapaPage', () => {
  let component: MapaPage;
  let fixture: ComponentFixture<MapaPage>;
  let servicioSpy: jasmine.SpyObj<EmergenciaService>;

  beforeEach(async () => {
    servicioSpy = jasmine.createSpyObj<EmergenciaService>('EmergenciaService', [
      'getEmergencias',
      'postEmergencia',
      'updateEmergencia',
      'deleteEmergencia'
    ]);

    servicioSpy.postEmergencia.and.returnValue(of({ id: 1 }));
    servicioSpy.getEmergencias.and.returnValue(of([]));
    servicioSpy.updateEmergencia.and.returnValue(of({}));
    servicioSpy.deleteEmergencia.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MapaPage],
      providers: [
        {
          provide: EmergenciaService,
          useValue: servicioSpy
        }
      ]
    })
      .overrideComponent(MapaPage, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(MapaPage);
    component = fixture.componentInstance;
  });

  it('debe crear la página', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar con valores por defecto', () => {
    expect(component.verFormulario).toBeFalse();
    expect(component.tipoEmergencia).toBe('Incendio');
    expect(component.descripcionEmergencia).toBe('');
  });

  it('debe activar formulario', () => {
    component.activarFormulario();

    expect(component.verFormulario).toBeTrue();
  });

  it('debe mostrar alerta si falta descripción', () => {
    const alertSpy = spyOn(window, 'alert');

    component.descripcionEmergencia = '   ';

    component.enviarNuevoReporte();

    expect(alertSpy).toHaveBeenCalled();
    expect(servicioSpy.postEmergencia).not.toHaveBeenCalled();
  });

  it('debe enviar reporte si tiene descripción', () => {
    const alertSpy = spyOn(window, 'alert');

    component.tipoEmergencia = 'Incendio';
    component.descripcionEmergencia = 'Fuego visible';
    component.ubicacionEmergencia = 'Calle prueba';
    component.latitud = -33.45;
    component.longitud = -70.66;
    component.verFormulario = true;

    component.enviarNuevoReporte();

    expect(servicioSpy.postEmergencia).toHaveBeenCalled();
    expect(component.descripcionEmergencia).toBe('');
    expect(component.tipoEmergencia).toBe('Incendio');
    expect(component.verFormulario).toBeFalse();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('debe retornar dirección corta desde respuesta con address', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        address: {
          road: 'Calle Test',
          house_number: '123',
          suburb: 'Santiago'
        }
      })
    } as Response));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toContain('Calle Test');
  });

  it('debe retornar display_name si no hay dirección corta', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        display_name: 'Dirección completa de prueba'
      })
    } as Response));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toBe('Dirección completa de prueba');
  });

  it('debe retornar dirección no disponible si falla fetch', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Error'));

    const direccion = await component.obtenerDireccion(-33.45, -70.66);

    expect(direccion).toBe('Dirección no disponible');
  });

  it('debe manejar inicializarMapa sin contenedor', () => {
    const errorSpy = spyOn(console, 'error');

    component.inicializarMapa(-33.45, -70.66);

    expect(errorSpy).toHaveBeenCalled();
  });
});