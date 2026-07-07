# Guía de Comandos - Sistema Totem Odontológico

Esta es una guía de referencia rápida con los comandos necesarios para trabajar en el proyecto, dónde ejecutarlos y cómo solucionar problemas de puertos trabados.

---

## 🛠️ Modo Desarrollo (Ver cambios en tiempo real)
Úsalo cuando estés modificando código (HTML, CSS/SCSS o TypeScript). Los cambios se recargarán solos en el navegador.

### 1. Iniciar la base de datos y la API (Backend)
*   **Carpeta donde ejecutar:** `c:\Users\USUARIO\Documents\odonto-app\server`
*   **Comando:**
    ```powershell
    npm start
    ```

### 2. Iniciar la interfaz visual (Frontend)
*   **Carpeta donde ejecutar (Raíz):** `c:\Users\USUARIO\Documents\odonto-app`
*   **Comando:**
    ```powershell
    npm start
    ```
*   **Acceso en navegador:** Abre [http://localhost:5000](http://localhost:5000)

---

## 🚀 Modo Producción (Cómo corre en el Tótem)
Úsalo cuando hayas terminado de hacer cambios y quieras probar el sistema exactamente como funciona en el consultorio.

### 1. Compilar los cambios del Frontend (Obligatorio si editaste el código visual)
*   **Carpeta donde ejecutar (Raíz):** `c:\Users\USUARIO\Documents\odonto-app`
*   **Comando:**
    ```powershell
    npm run build
    ```

### 2. Iniciar el Servidor de Producción
*   **Carpeta donde ejecutar:** `c:\Users\USUARIO\Documents\odonto-app\server`
*   **Comando:**
    ```powershell
    npm start
    ```
*   **Acceso en navegador:** Abre [http://localhost:3000](http://localhost:3000)

### 3. Iniciar el Totem Automático (Modo Kiosco + Impresión Directa)
*   **Carpeta donde ejecutar (Raíz):** `c:\Users\USUARIO\Documents\odonto-app`
*   **Comando:**
    ```powershell
    .\iniciar-totem.bat
    ```
    *(También puedes hacer doble clic en el archivo `iniciar-totem.bat` desde el explorador de archivos de Windows).*

---

## 🛑 Cómo Apagar el Programa y Liberar Puertos (Solución de errores)
Si al querer iniciar el servidor te da error de que el puerto ya está en uso (`EADDRINUSE`), ejecuta estos comandos en cualquier terminal de PowerShell:

*   **Detener la ejecución activa (Ctrl + C):** Presiona `Ctrl + C` en la pestaña de la terminal que está corriendo.
*   **Liberar el Puerto 3000 (Backend):**
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
    ```
*   **Liberar el Puerto 5000 (Angular):**
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
    ```
*   **Cerrar Chrome a la fuerza (Modo Kiosco):**
    ```powershell
    Stop-Process -Name chrome -Force
    ```

---

## 👤 Configuración Inicial de Git (Si da error de identidad en Commits)
Si al hacer un `git commit` te pide identificarte, ejecuta estos comandos en la raíz (`c:\Users\USUARIO\Documents\odonto-app`):

*   **Configurar Nombre:**
    ```powershell
    git config --global user.name "Tu Nombre"
    ```
*   **Configurar Correo:**
    ```powershell
    git config --global user.email "tu-email-de-github@ejemplo.com"
    ```

---

## 🔄 Flujo para Actualizar Cambios desde GitHub (Actualizar PC del Consultorio)
Cuando trabajes en otra computadora, subas tus cambios a GitHub y quieras aplicarlos en la PC del Consultorio (Tótem), debes realizar los siguientes pasos en la PC del consultorio:

### 1. Descargar los últimos cambios
Abre una terminal en la raíz del proyecto (`c:\Users\USUARIO\Documents\odonto-app`) y descarga el código:
```powershell
git pull origin main
```

### 2. Instalar nuevas librerías (Solo si agregaste alguna dependencia nueva)
*   **En la raíz:**
    ```powershell
    npm install
    ```
*   **En la carpeta server (si agregaste algo al backend):**
    ```powershell
    cd server
    npm install
    cd ..
    ```

### 3. Compilar los cambios visuales
*(En la raíz del proyecto)*
```powershell
npm run build
```

### 4. Reiniciar el Tótem
Ejecuta el script de inicio para que cierre los procesos anteriores y levante todo de manera limpia y automática con los nuevos cambios:
```powershell
.\iniciar-totem.bat
```

