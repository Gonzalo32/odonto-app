@echo off
title Tótem SENZA - Iniciando...

:: Configuración
set APP_DIR=C:\Users\Administrador\Desktop\totem
set SERVER_PORT=3000
set APP_URL=http://localhost:%SERVER_PORT%

echo ================================================
echo       SENZA - Sistema Tótem Odontológico
echo ================================================
echo.

:: Verificar si el puerto ya está en uso (si el server ya está corriendo)
netstat -ano | findstr ":%SERVER_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] El servidor ya está corriendo en el puerto %SERVER_PORT%.
    goto :abrir_navegador
)

:: Iniciar el servidor Node.js en segundo plano
echo [INFO] Iniciando servidor...
start /min "" cmd /c "cd /d %APP_DIR%\server && node server.js > %APP_DIR%\server\totem.log 2>&1"

:: Esperar a que el servidor levante (máx 15 segundos)
echo [INFO] Esperando que el servidor esté listo...
set /a intentos=0
:esperar
set /a intentos+=1
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":%SERVER_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 goto :abrir_navegador
if %intentos% geq 8 goto :error_servidor
goto :esperar

:abrir_navegador
echo [OK] Servidor listo en %APP_URL%
echo [INFO] Abriendo aplicación en Chrome...

:: Abrir Chrome en modo kiosco (pantalla completa sin barras de herramientas)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --no-first-run --disable-translate --disable-infobars --disable-features=TranslateUI --app=%APP_URL%

echo [OK] Totem iniciado correctamente.
goto :fin

:error_servidor
echo [ERROR] El servidor no respondió a tiempo.
echo Revisá el log en: %APP_DIR%\server\totem.log
pause

:fin
exit
