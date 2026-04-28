# Guía de Instalación del Totem SENZA en una Computadora Nueva

Esta guía detalla todos los pasos necesarios para configurar y poner en marcha la aplicación en una PC limpia.

## 1. Requisitos Previos (Instalar en este orden)

### A. Google Chrome
* Descargar e instalar Chrome desde: [google.com/chrome](https://www.google.com/chrome/)
* Es necesario para el modo Kiosco y la impresión automática.

### B. Node.js (Versión LTS)
* Descargar e instalar la versión **LTS** (actualmente v20 o v22) desde: [nodejs.org](https://nodejs.org/)
* Durante la instalación, marcar la casilla que dice "Automatically install the necessary tools" (esto instalará Chocolatey y otras dependencias útiles).

### C. MongoDB Community Server
* Descargar e instalar desde: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
* Seleccionar "Complete installation".
* Asegurarse de que esté marcada la opción "Install MongoDB as a Service".
* **Importante**: Instalar también "MongoDB Compass" (viene incluido en el instalador) para poder ver los datos fácilmente.

### D. Git for Windows
* Descargar e instalar desde: [git-scm.com](https://git-scm.com/)

---

## 2. Descargar el Proyecto

1. Abrir una terminal (PowerShell o CMD).
2. Ubicarse en la carpeta donde se quiera guardar el proyecto (ej: Escritorio).
3. Clonar el repositorio:
   ```bash
   git clone https://github.com/Gonzalo32/odonto-app.git
   ```
4. Entrar a la carpeta:
   ```bash
   cd odonto-app
   ```

---

## 3. Configuración Inicial

### A. Crear archivo de entorno (.env)
1. Dentro de la carpeta `odonto-app`, buscá el archivo `.env.example`.
2. Hacé una copia y llamala simplemente `.env`.
3. Abrilo con el Bloc de Notas y asegurate de que diga:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/senza_totem
   ```

### B. Instalar dependencias del Frontend
En la raíz del proyecto (`odonto-app`), ejecutá:
```bash
npm install
```

### C. Instalar dependencias del Backend (Server)
Entrá a la carpeta `server` y ejecutá:
```bash
cd server
npm install
cd ..
```

---

## 4. Preparar la Aplicación (Build)

Antes de ejecutar el programa por primera vez, hay que compilar el código de Angular:
```bash
npx ng build
```
*Esto creará la carpeta `dist/totem-app`, que es la que usa el servidor para mostrar la web.*

---

## 5. Configurar Impresora (HP LaserJet 1020)

1. Conectar la impresora a la PC e instalar sus drivers oficiales de Windows.
2. Asegurarse de que la impresora aparezca en el Panel de Control con el nombre exacto: **HP LaserJet 1020**.
3. El script del Totem configurará automáticamente esta impresora como predeterminada para Chrome la primera vez que inicies.

---

## 6. Ejecución Automática

Para iniciar el sistema, simplemente hacé doble clic en el archivo:
`iniciar-totem.bat`

**Recomendación**: La primera vez, ejecutalo con **Click Derecho -> Ejecutar como administrador** para que el script pueda aplicar los parches de registro necesarios para habilitar las Developer Tools y configurar Chrome correctamente.

---

## 7. Mantenimiento y Actualizaciones

Si hacés cambios en el código (GitHub) y querés bajarlos a esta PC:
1. Abrir terminal en la carpeta del proyecto.
2. Bajar cambios: `git pull origin main`
3. Re-compilar: `npx ng build`
4. Cerrar y volver a abrir el `.bat`.
