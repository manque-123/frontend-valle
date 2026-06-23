import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
selector: 'app-login',
templateUrl: './login.page.html',
styleUrls: ['./login.page.scss'],
standalone: true,
imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {

usuarioAdmin: string = '';
contrasenaAdmin: string = '';

constructor(private router: Router) { }

ngOnInit() { }

limpiarRut(rut: string): string {
return (rut || '')
.replace(/./g, '')
.replace(/-/g, '')
.replace(/\s/g, '')
.trim()
.toUpperCase();
}

iniciarSesionAdmin() {
const usuarioIngresado = (this.usuarioAdmin || '').trim();
const usuarioIngresadoMinuscula = usuarioIngresado.toLowerCase();
const rutIngresado = this.limpiarRut(usuarioIngresado);
const contrasenaIngresada = (this.contrasenaAdmin || '').trim();

if (!usuarioIngresado || !contrasenaIngresada) {
  alert('Por favor, ingresa tu RUT o usuario y contrasena.');
  return;
}

const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');

if (!usuariosGuardados || usuariosGuardados.length === 0) {
  alert('No hay cuentas registradas. Primero crea una cuenta de administrador.');
  return;
}

const adminValido = usuariosGuardados.find((u: any) => {
  const usuarioGuardado = (
    u.username ||
    u.usuario ||
    u.nombreUsuario ||
    ''
  ).toString().trim().toLowerCase();

  const rutGuardado = this.limpiarRut(u.rut || u.rutOriginal || '');

  const passwordGuardado = (
    u.password ||
    u.contrasena ||
    ''
  ).toString().trim();

  const coincideUsuario = usuarioGuardado === usuarioIngresadoMinuscula;
  const coincideRut = rutGuardado === rutIngresado;
  const coincidePassword = passwordGuardado === contrasenaIngresada;

  return (coincideUsuario || coincideRut) && coincidePassword;
});

if (!adminValido) {
  alert('Usuario, RUT o contrasena incorrectos.');
  return;
}

const nombreAdministrador =
  adminValido.username ||
  adminValido.usuario ||
  adminValido.nombreUsuario ||
  'Autoridad Municipal';

localStorage.setItem('rol_usuario', 'admin');
localStorage.setItem('nombre_usuario', nombreAdministrador);
localStorage.setItem('admin_rut', adminValido.rut || adminValido.rutOriginal || '');

alert('Bienvenido Autoridad Municipal: ' + nombreAdministrador);
this.router.navigateByUrl('/admin-emergencias');

}

ingresarComoCiudadano() {
localStorage.setItem('rol_usuario', 'ciudadano');
localStorage.removeItem('admin_rut');
localStorage.removeItem('nombre_usuario');

this.router.navigateByUrl('/admin-emergencias');

}

pedirClaveAcceso(titulo: string): string | null {
const clave = prompt(titulo);

if (clave === null) {
  return null;
}

return clave.trim();

}

ingresarComoBomberos() {
const clave = this.pedirClaveAcceso('Clave Bomberos');

if (clave === null) {
  return;
}

if (clave !== 'bomberos123') {
  alert('Clave incorrecta para Bomberos.');
  return;
}

localStorage.setItem('rol_usuario', 'bomberos');
localStorage.setItem('nombre_usuario', 'Bomberos');

this.router.navigateByUrl('/admin-emergencias');

}

ingresarComoBrigada() {
const clave = this.pedirClaveAcceso('Clave Brigada Municipal');

if (clave === null) {
  return;
}

if (clave !== 'brigada123') {
  alert('Clave incorrecta para Brigada Municipal.');
  return;
}

localStorage.setItem('rol_usuario', 'brigada');
localStorage.setItem('nombre_usuario', 'Brigada Municipal');

this.router.navigateByUrl('/admin-emergencias');

}

irAlRegistro() {
this.router.navigateByUrl('/registro');
}

}