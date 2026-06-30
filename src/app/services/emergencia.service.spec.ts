import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EmergenciaService } from './emergencia.service';

describe('EmergenciaService', () => {
  let service: EmergenciaService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://backend-0-valle.onrender.com/api/emergencias';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmergenciaService]
    });

    service = TestBed.inject(EmergenciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener emergencias con GET', () => {
    const respuestaMock = [
      {
        id: 1,
        tipo: 'Incendio',
        descripcion: 'Fuego cercano',
        ubicacion: 'Valle del Sol'
      }
    ];

    service.getEmergencias().subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaMock);
      expect(respuesta.length).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(respuestaMock);
  });

  it('debe enviar una emergencia con POST', () => {
    const nuevaEmergencia = {
      tipo: 'Incendio',
      descripcion: 'Humo visible',
      ubicacion: 'Sector norte'
    };

    const respuestaMock = {
      id: 2,
      ...nuevaEmergencia
    };

    service.postEmergencia(nuevaEmergencia).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaMock);
      expect(respuesta.id).toBe(2);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevaEmergencia);
    req.flush(respuestaMock);
  });

  it('debe actualizar una emergencia con PUT', () => {
    const datosActualizados = {
      estado: 'CONTROLADO'
    };

    const respuestaMock = {
      id: 5,
      estado: 'CONTROLADO'
    };

    service.updateEmergencia(5, datosActualizados).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaMock);
      expect(respuesta.estado).toBe('CONTROLADO');
    });

    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datosActualizados);
    req.flush(respuestaMock);
  });

  it('debe eliminar una emergencia con DELETE', () => {
    const respuestaMock = {
      mensaje: 'Emergencia eliminada'
    };

    service.deleteEmergencia(8).subscribe(respuesta => {
      expect(respuesta).toEqual(respuestaMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/8`);
    expect(req.request.method).toBe('DELETE');
    req.flush(respuestaMock);
  });
});