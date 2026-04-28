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

echo [INFO] Reiniciando servicios...
:: Matar proceso en puerto 3000 (Node)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%SERVER_PORT% ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
:: Matar Chrome
TASKKILL /F /IM chrome.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

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
echo [INFO] Habilitando Developer Tools en el registro...
reg add "HKCU\Software\Policies\Google\Chrome" /v DeveloperToolsAvailability /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome" /v DeveloperToolsDisabled /t REG_DWORD /d 0 /f >nul 2>&1

echo [INFO] Configurando impresora en Chrome...
node "%APP_DIR%\scripts\set-chrome-printer.js"

set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

TASKKILL /F /IM chrome.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

echo [INFO] Abriendo Totem con DevTools habilitado...
:: Quitamos --kiosk temporalmente para que puedas usar F12 y ver la consola si el auto-open falla
start "" "%CHROME%" --kiosk-printing --auto-open-devtools-for-tabs --no-first-run --disable-translate --disable-infobars --disable-features=TranslateUI "%APP_URL%"

echo [OK] Totem iniciado correctamente.
goto :fin

:error_servidor
echo [ERROR] El servidor no respondio a tiempo.
echo Revisa el log en: %APP_DIR%\server\totem.log
pause

:fin
exit
