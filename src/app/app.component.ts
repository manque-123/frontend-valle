import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
selector: 'app-root',
templateUrl: 'app.component.html',
standalone: true,
imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {

constructor(private platform: Platform) {
this.configurarBarraSuperior();
}

async configurarBarraSuperior() {
await this.platform.ready();

if (Capacitor.isNativePlatform()) {
  await StatusBar.setOverlaysWebView({ overlay: false });
  await StatusBar.setBackgroundColor({ color: '#ffffff' });
  await StatusBar.setStyle({ style: Style.Dark });
}


}
}
