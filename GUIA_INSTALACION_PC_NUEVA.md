# Guía de Instalación y Configuración para PC Nueva (Consultorio)

Esta guía detalla los pasos exactos para dejar el sistema "Totem" funcionando de manera definitiva y autónoma en una computadora nueva, orientada al entorno de producción (uso real).

---

## 1. Requisitos Previos (¿Qué descargar e instalar?)

**NO necesitas un IDE** (como Visual Studio Code). Solo requieres instalar los siguientes programas básicos (asegúrate de descargar las versiones para Windows):

1. **Node.js (Versión LTS)**: Es el motor que ejecutará el servidor. Se descarga de `nodejs.org`.
2. **Git**: Para descargar el proyecto desde GitHub. Se descarga de `git-scm.com`.
3. **MongoDB Community Server**: Es el motor de la base de datos. Se descarga de `mongodb.com/try/download/community`. Durante la instalación, puedes dejar todas las opciones por defecto (se instalará como un servicio de Windows que arranca solo).
4. **Google Chrome**: El navegador recomendado para el modo kiosko y la impresión silenciosa.

---

## 2. Descarga del Proyecto

1. Abre una terminal (presiona la tecla Windows, escribe `cmd` o `PowerShell` y abre el programa).
2. Ubícate en la carpeta donde quieres que resida el programa (por ejemplo, en la raíz del disco C o en una carpeta de sistema, no importa mientras sepas la ruta):
   ```bash
   cd C:\
   ```
3. Clona tu repositorio desde GitHub:
   ```bash
   git clone https://github.com/Gonzalo32/odonto-app.git
   ```
4. Entra a la carpeta que se acaba de crear:
   ```bash
   cd odonto-app
   ```

---

## 3. Configuración de la Base de Datos (MongoDB)

Al instalar MongoDB localmente con las opciones por defecto, tu dirección de base de datos es:
`mongodb://127.0.0.1:27017/senza_totem`

**(No tienes que crear la base de datos manualmente. MongoDB la creará automáticamente cuando la aplicación guarde el primer paciente).**

Para configurar esta dirección en el proyecto:
1. Ve a la carpeta `odonto-app` (la raíz del proyecto).
2. Crea un archivo llamado exactamente `.env` (asegúrate de que no tenga extensión oculta `.txt`).
3. Ábrelo con el Bloc de notas y escribe esta única línea:
   ```text
   MONGODB_URI=mongodb://127.0.0.1:27017/senza_totem
   ```
4. Guarda y cierra.

---

## 4. Instalación de Paquetes y Librerías

Necesitas descargar las librerías necesarias de Node.js, pero **solo la primera vez**. En la terminal, estando dentro de la carpeta `odonto-app`:

1. Instala las librerías generales del frontend:
   ```bash
   npm install
   ```
2. Entra a la carpeta del servidor e instala sus librerías:
   ```bash
   cd server
   npm install
   ```
3. Vuelve a la carpeta principal:
   ```bash
   cd ..
   ```

---

## 5. Compilación del Proyecto (Modo Producción)

Para que el programa corra de manera optimizada y rápida, debes "compilar" la aplicación. En la misma terminal ejecuta:
```bash
npm run build:prod
```
*Este proceso puede tardar un par de minutos. Toma el código fuente y genera archivos optimizados en la carpeta `dist`. Ya no usarás `npm start` que es solo para desarrollo.*

---

## 6. Automatización (Para que arranque solo al prender la PC)

Para que todo sea automático sin intervención humana, debes usar el archivo `.bat` que configuramos anteriormente.

Crea un archivo llamado `iniciar_totem.bat` (puede estar en el Escritorio para fácil acceso o directamente en la carpeta de Inicio automático de Windows: presiona `Win + R`, escribe `shell:startup` y pon el archivo allí).

El contenido de ese archivo `.bat` debe ser:

```bat
@echo off
cd C:\ruta\a\tu\odonto-app
:: Levanta el servidor en segundo plano
start /B npm run start:prod
:: Espera un par de segundos a que el servidor encienda
timeout /t 3 /nobreak
:: Abre Chrome en modo Kiosko con impresión silenciosa
start chrome --kiosk --kiosk-printing http://localhost:3000
```
*(Asegúrate de cambiar `C:\ruta\a\tu\odonto-app` por la ruta real donde clonaste la carpeta).*

### ¡Listo!
Al ejecutar ese archivo `.bat` (o al encender la PC si lo pusiste en `shell:startup`), se encenderá el servidor backend en el puerto 3000 (conectándose a tu MongoDB local) y Chrome se abrirá a pantalla completa y sin diálogos de impresión, completamente listo para que los pacientes ingresen.
