import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // 1. Importamos el Router

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HomePage {

  // 2. Lo inyectamos en el constructor
  constructor(private router: Router) {}

  // 3. Creamos una función para navegar
  irAReportar() {
    this.router.navigate(['/emergencias']);
  }
}