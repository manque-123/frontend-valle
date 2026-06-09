import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-usuarios',
  templateUrl: './registro.page.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RegistroPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }

  ejecutarRegistroDirecto(rutRecibido: string, usuarioRecibido: string, contrasenaRecibida: string) {
    if (!rutRecibido || !usuarioRecibido || !contrasenaRecibida) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const rutLimpio = rutRecibido.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();

    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
    const existeRut = usuariosGuardados.some((u: any) => u.rut === rutLimpio);

    if (existeRut) {
      alert('❌ Error: Este RUT ya se encuentra registrado como Administrador.');
      return;
    }

    const letrasMatch = contrasenaRecibida.match(/[a-zA-Z]/g);
    const cantidadLetras = letrasMatch ? letrasMatch.length : 0;
    const tieneNumero = /\d/.test(contrasenaRecibida);
    const tieneSigno = /[^a-zA-Z0-9]/.test(contrasenaRecibida);

    if (cantidadLetras < 4 || !tieneNumero || !tieneSigno) {
      alert('⚠️ La contraseña debe tener mínimo 4 letras, 1 número y 1 signo.');
      return;
    }

    usuariosGuardados.push({
      rut: rutLimpio,
      username: usuarioRecibido.trim(),
      password: contrasenaRecibida
    });
    localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosGuardados));

    alert('🎉 ¡Administrador registrado con éxito!');
    window.location.href = '#/login';
  }

  irAlLoginAlTiro() {
    window.location.href = '#/login';
  }
}