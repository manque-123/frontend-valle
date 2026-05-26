import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; 
import { EmergenciaService } from '../../../services/emergencia.service';

// ... imports arriba ...

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit { // <-- Verifica que diga EXACTAMENTE 'LoginPage'
// ... resto del código ...
  usuario: string = "";
  contrasena: string = "";

  constructor(
    private emergenciaService: EmergenciaService,
    private router: Router 
  ) { }

  ngOnInit() { }

  onLogin() {
    console.log("Botón presionado. Usuario ingresado:", this.usuario);

    // Si el usuario es genesis, entra directo.
    if (this.usuario.toLowerCase() === 'genesis') {
      alert("¡Acceso Correcto! Bienvenida al sistema.");
      this.router.navigate(['/home']); // Te lleva a la pantalla principal
    } else {
      alert("Para la prueba usa el usuario: genesis");
    }
  }
}