# Valle del Sol - Frontend

Aplicación móvil desarrollada con Ionic, Angular y Capacitor para el reporte y gestión de emergencias forestales y comunitarias.

## Objetivo

Permitir que ciudadanos reporten emergencias desde el celular usando ubicación GPS, mientras administradores, Bomberos y Brigada Municipal pueden revisar, derivar y actualizar los reportes.

## Tecnologías

- Ionic
- Angular
- Capacitor
- TypeScript
- Leaflet
- Google Maps Embed
- Karma / Jasmine
- Android APK

## Funcionalidades principales

- Login de administrador.
- Registro de administrador.
- Acceso ciudadano para reportar emergencias.
- Acceso institucional para Bomberos y Brigada Municipal.
- Captura de ubicación GPS.
- Visualización de ubicación en mapa.
- Creación de reportes de emergencia.
- Listado de reportes desde backend.
- Actualización de estado.
- Derivación a instituciones.
- Eliminación de reportes.
- Alertas comunitarias.
- Generación de APK Android.

## Backend conectado

La app consume el backend desplegado en Render:

https://backend-0-valle.onrender.com/api/emergencias

Operaciones usadas:

- GET: listar emergencias.
- POST: crear emergencia.
- PUT: actualizar estado o derivación.
- DELETE: eliminar reporte.

## Estructura principal

- src/app/services/emergencia.service.ts  
  Centraliza las llamadas HTTP al backend.

- src/app/pages/admin-emergencias  
  Panel principal para reportes, filtros, derivación, cambio de estado y alertas.

- src/app/modules/usuarios/login  
  Login y accesos por rol.

- src/app/modules/usuarios/registro  
  Registro de administrador.

## Roles de acceso

- Administrador municipal.
- Ciudadano.
- Bomberos.
- Brigada Municipal.

## Comandos útiles

Instalar dependencias:

npm install

Ejecutar en navegador:

ionic serve

Compilar frontend:

npm run build

Ejecutar pruebas unitarias:

npm test -- --watch=false --code-coverage

Sincronizar Android:

npx cap sync android

Generar APK:

cd android
.\gradlew assembleDebug

APK generada:

android/app/build/outputs/apk/debug/app-debug.apk

## Pruebas unitarias

El proyecto cuenta con pruebas unitarias ejecutadas con Karma y Jasmine.

Resultado validado:

- 87 pruebas exitosas.
- Cobertura superior al 60%.

## Estado del proyecto

- Frontend conectado al backend real.
- APK instalada y probada en Android.
- CRUD funcional desde la app.
- Login ordenado por roles.
- Ícono y nombre de app personalizados.
- Textos corregidos para visualización móvil.
