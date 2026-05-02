import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class LoginPage {

  usuario: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    if (this.usuario === 'admin' && this.password === '1234') {
      this.router.navigate(['/emergencias']);
    } else {
      alert('Datos incorrectos');
    }
  }
}