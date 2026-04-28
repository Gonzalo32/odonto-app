@echo off
title Totem SENZA - Iniciando...

set APP_DIR=%~dp0
set APP_DIR=%APP_DIR:~0,-1%
set SERVER_PORT=3000
set APP_URL=http://localhost:%SERVER_PORT%

echo ================================================
echo       SENZA - Sistema Totem Odontologico
echo ================================================
echo.

:: [1] Verificar si el servidor ya esta corriendo
netstat -ano | findstr ":%SERVER_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 goto :configurar_impresora

:: [2] Iniciar servidor Node.js minimizado
echo [INFO] Iniciando servidor Node.js...
start /min "" cmd /c "cd /d "%APP_DIR%\server" && node server.js > "%APP_DIR%\server\totem.log" 2>&1"

echo [INFO] Esperando que el servidor este listo...
set /a i=0
:esperar
set /a i+=1
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":%SERVER_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 goto :configurar_impresora
if %i% geq 15 goto :error_servidor
goto :esperar

:configurar_impresora
:: ============================================================
:: [3] Configurar Chrome Preferences para usar la HP 1020
::     (modifica el JSON de preferencias directamente via Node.js)
:: ============================================================
echo [INFO] Configurando HP 1020 como impresora en Chrome...
node "%APP_DIR%\scripts\set-chrome-printer.js"


:: [4] Buscar Chrome
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: Cerrar instancias previas
TASKKILL /F /IM chrome.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

echo [INFO] Abriendo Totem en modo kiosco...
echo.
echo  --kiosk          = pantalla completa sin controles
echo  --kiosk-printing = impresion AUTOMATICA y SILENCIOSA
echo  DefaultPrinterSelection = impresora fisica configurada arriba
echo.

:: --kiosk + --kiosk-printing: con el destino correcto configurado
:: en la politica, --kiosk-printing manda directo a la impresora
:: sin mostrar ningun dialogo.
start "" "%CHROME%" --kiosk --kiosk-printing --no-first-run --disable-translate --disable-infobars --disable-features=TranslateUI "%APP_URL%"

echo [OK] Totem iniciado correctamente.
goto :fin

:error_servidor
echo [ERROR] El servidor no respondio a tiempo.
echo Revisa el log en: %APP_DIR%\server\totem.log
pause

:fin
exit
