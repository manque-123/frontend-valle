import { LoginPage } from './login.page';
import { Router } from '@angular/router';

describe('LoginPage', () => {
let component: LoginPage;
let routerMock: any;

beforeEach(() => {
localStorage.clear();

routerMock = {
  navigateByUrl: jasmine.createSpy('navigateByUrl')
};

component = new LoginPage(routerMock as Router);

});

it('debe crear el componente login', () => {
expect(component).toBeTruthy();
});

it('debe limpiar el RUT correctamente', () => {
const resultado = component.limpiarRut('20.453.123-k');

expect(resultado).toBe('20453123K');

});

it('debe ingresar como ciudadano', () => {
component.ingresarComoCiudadano();

expect(localStorage.getItem('rol_usuario')).toBe('ciudadano');
expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/admin-emergencias');

});

it('debe ingresar como bomberos con clave correcta', () => {
spyOn(window, 'prompt').and.returnValue('bomberos123');

component.ingresarComoBomberos();

expect(localStorage.getItem('rol_usuario')).toBe('bomberos');
expect(localStorage.getItem('nombre_usuario')).toBe('Bomberos');
expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/admin-emergencias');

});

it('no debe ingresar como bomberos con clave incorrecta', () => {
spyOn(window, 'prompt').and.returnValue('mala');
spyOn(window, 'alert');

component.ingresarComoBomberos();

expect(localStorage.getItem('rol_usuario')).toBeNull();
expect(window.alert).toHaveBeenCalledWith('Clave incorrecta para Bomberos.');

});

it('debe ingresar como brigada con clave correcta', () => {
spyOn(window, 'prompt').and.returnValue('brigada123');

component.ingresarComoBrigada();

expect(localStorage.getItem('rol_usuario')).toBe('brigada');
expect(localStorage.getItem('nombre_usuario')).toBe('Brigada Municipal');
expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/admin-emergencias');

});
});