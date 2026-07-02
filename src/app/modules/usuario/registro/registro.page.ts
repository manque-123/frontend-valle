import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
selector: 'app-registro-usuarios',
templateUrl: './registro.page.html',
styleUrls: ['./registro.page.scss'],
standalone: true,
imports: [CommonModule, FormsModule, IonicModule]
})
export class RegistroPage implements OnInit {

rutAdmin: string = '';
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

ejecutarRegistroDirecto() {
const rutLimpio = this.limpiarRut(this.rutAdmin);
const usuarioLimpio = (this.usuarioAdmin || '').trim();
const contrasenaLimpia = (this.contrasenaAdmin || '').trim();

if (!rutLimpio || !usuarioLimpio || !contrasenaLimpia) {
  alert('Por favor, complete RUT, usuario y contrase\u00f1a.');
  return;
}

const letrasMatch = contrasenaLimpia.match(/[a-zA-Z]/g);
const cantidadLetras = letrasMatch ? letrasMatch.length : 0;
const tieneNumero = /\d/.test(contrasenaLimpia);
const tieneSigno = /[^a-zA-Z0-9]/.test(contrasenaLimpia);

if (cantidadLetras < 4 || !tieneNumero || !tieneSigno) {
  alert('La contrase\u00f1a debe tener m\u00ednimo 4 letras, 1 n\u00famero y 1 car\u00e1cter especial.');
  return;
}

const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');

const nuevoAdmin = {
  rut: rutLimpio,
  rutOriginal: this.rutAdmin.trim(),
  username: usuarioLimpio,
  usuario: usuarioLimpio,
  nombreUsuario: usuarioLimpio,
  password: contrasenaLimpia,
  contrasena: contrasenaLimpia,
  rol: 'admin',
  fechaRegistro: new Date().toISOString()
};

const indiceExistente = usuariosGuardados.findIndex((u: any) => {
  const rutGuardado = this.limpiarRut(u.rut || u.rutOriginal || '');
  const usuarioGuardado = (
    u.username ||
    u.usuario ||
    u.nombreUsuario ||
    ''
  ).toString().trim().toLowerCase();

  return rutGuardado === rutLimpio || usuarioGuardado === usuarioLimpio.toLowerCase();
});

if (indiceExistente >= 0) {
  usuariosGuardados[indiceExistente] = nuevoAdmin;
} else {
  usuariosGuardados.push(nuevoAdmin);
}

localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosGuardados));

alert('Administrador registrado con ÃƒÂ©xito. Ahora inicia sesiÃƒÂ³n.');

this.rutAdmin = '';
this.usuarioAdmin = '';
this.contrasenaAdmin = '';

this.router.navigateByUrl('/login');

}

irAlLoginAlTiro() {
this.router.navigateByUrl('/login');
}
}
