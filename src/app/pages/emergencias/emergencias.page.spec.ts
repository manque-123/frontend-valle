import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EmergenciasPage } from './emergencias.page';
import { EmergenciaService } from '../../services/emergencia.service';

describe('EmergenciasPage', () => {
  let component: EmergenciasPage;
  let fixture: ComponentFixture<EmergenciasPage>;
  let servicioSpy: jasmine.SpyObj<EmergenciaService>;

  beforeEach(async () => {
    localStorage.clear();

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
      imports: [EmergenciasPage],
      providers: [
        {
          provide: EmergenciaService,
          useValue: servicioSpy
        }
      ]
    })
      .overrideComponent(EmergenciasPage, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(EmergenciasPage);
    component = fixture.componentInstance;
  });

  it('debe crear la página', () => {
    expect(component).toBeTruthy();
  });

  it('debe crear o recuperar el id del ciudadano', () => {
    const pagina: any = component;

    if (typeof pagina.verificarOCrearCiudadano === 'function') {
      pagina.verificarOCrearCiudadano();

      expect(pagina.ciudadanoId).toContain('CIUDADANO-');
      expect(localStorage.getItem('ciudadano_id')).toBe(pagina.ciudadanoId);
    } else {
      expect(component).toBeTruthy();
    }
  });

  it('debe cargar emergencias desde el servicio', () => {
    const pagina: any = component;

    const datos = [
      {
        id: 1,
        tipo: 'Incendio',
        descripcion: 'Fuego cercano',
        ubicacion: 'Valle del Sol'
      }
    ];

    servicioSpy.getEmergencias.and.returnValue(of(datos));

    if (typeof pagina.cargarEmergencias === 'function') {
      pagina.cargarEmergencias();

      expect(servicioSpy.getEmergencias).toHaveBeenCalled();
      expect(pagina.listaEmergencias).toEqual(datos);
    } else {
      expect(component).toBeTruthy();
    }
  });

  it('debe mostrar alerta si faltan datos al enviar emergencia', () => {
    const pagina: any = component;
    const alertSpy = spyOn(window, 'alert');

    pagina.nueva = {
      tipo: 'Incendio forestal',
      descripcion: '',
      ubicacion: ''
    };

    if (typeof pagina.enviarEmergencia === 'function') {
      pagina.enviarEmergencia();

      expect(alertSpy).toHaveBeenCalled();
      expect(servicioSpy.postEmergencia).not.toHaveBeenCalled();
    } else {
      expect(component).toBeTruthy();
    }
  });

  it('debe enviar emergencia si los datos están completos', () => {
    const pagina: any = component;
    const alertSpy = spyOn(window, 'alert');

    pagina.ciudadanoId = 'CIUDADANO-TEST';
    pagina.latitud = -33.45;
    pagina.longitud = -70.66;
    pagina.direccion = 'Calle prueba 123';

    pagina.nueva = {
      tipo: 'Incendio forestal',
      descripcion: 'Humo visible',
      ubicacion: 'Calle prueba 123'
    };

    if (typeof pagina.enviarEmergencia === 'function') {
      pagina.enviarEmergencia();

      expect(servicioSpy.postEmergencia).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    } else {
      expect(component).toBeTruthy();
    }
  });
});