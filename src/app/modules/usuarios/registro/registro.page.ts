import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroPage implements OnInit {

  nuevoUsuario: string = '';
  nuevaContrasena: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  registrar() {
    // 1. Validar que los campos no estén vacíos
    if (this.nuevoUsuario.trim() === '' || this.nuevaContrasena.trim() === '') {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // 2. Validar que la contraseña tenga más de 4 caracteres
    if (this.nuevaContrasena.length <= 4) {
      alert('La contraseña debe tener más de 4 caracteres.');
      return;
    }

    // 3. Validar que la contraseña contenga al menos un número
    // La expresión /\d/ busca cualquier dígito del 0 al 9 en el texto
    const contieneNumeros = /\d/.test(this.nuevaContrasena);
    if (!contieneNumeros) {
      alert('La contraseña debe contener al menos un número.');
      return;
    }

    // Si pasa todas las pruebas, creamos la cuenta
    alert('¡Cuenta creada con éxito!');
    localStorage.setItem('usuarioLogueado', this.nuevoUsuario);
    this.router.navigate(['/home']);
  }
}