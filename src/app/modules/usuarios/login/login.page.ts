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

  iniciarSesionAdmin() {
    if (!this.usuarioAdmin || !this.contrasenaAdmin) {
      alert('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
    const adminValido = usuariosGuardados.find(
      (u: any) => u.username === this.usuarioAdmin.trim() && u.password === this.contrasenaAdmin
    );

    if (adminValido) {
      localStorage.setItem('rol_usuario', 'admin');
      localStorage.setItem('admin_rut', adminValido.rut);
      alert(`¡Bienvenido Administrador: ${adminValido.username}!`);
      this.router.navigateByUrl('/admin-emergencias');
    } else {
      alert('❌ Usuario o contraseña incorrectos.');
    }
  }

  ingresarComoCiudadano() {
    // Seteamos el rol como ciudadano para que la vista active el mapa en vez de la lista vacía
    localStorage.setItem('rol_usuario', 'ciudadano');
    localStorage.removeItem('admin_rut');
    
    // Redirigimos al panel oficial que ya sabe cómo pintar el mapa de OpenStreetMap
    this.router.navigateByUrl('/admin-emergencias');
  }

  irAlRegistro() {
    this.router.navigateByUrl('/registro');
  }
}