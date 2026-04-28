# registrar-autostart.ps1
# Registra el totem SENZA para que inicie automaticamente al encender la PC.
# Metodo: Acceso directo en la carpeta Inicio de Windows (no requiere permisos de Administrador)
# INSTRUCCIONES: Clic derecho -> Ejecutar con PowerShell

$BatPath      = "$PSScriptRoot\iniciar-totem.bat"
$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath  = "$StartupFolder\TotemSENZA.lnk"

# Verificar que el .bat existe
if (-not (Test-Path $BatPath)) {
    Write-Host "ERROR: No se encontro el archivo: $BatPath" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde la carpeta del totem." -ForegroundColor Yellow
    pause
    exit 1
}

# Crear el acceso directo (.lnk) en la carpeta Inicio
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath       = "cmd.exe"
$Shortcut.Arguments        = "/c `"$BatPath`""
$Shortcut.WorkingDirectory = (Split-Path $BatPath)
$Shortcut.WindowStyle      = 7    # 7 = minimizado
$Shortcut.Description      = "Totem SENZA Consultorios Odontologicos"
$Shortcut.Save()

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  [OK] Totem SENZA configurado para auto-inicio" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Acceso directo en carpeta Inicio:" -ForegroundColor White
Write-Host "  $ShortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "El totem se abrira automaticamente la proxima vez que" -ForegroundColor White
Write-Host "inicies sesion en Windows con el usuario: $env:USERNAME" -ForegroundColor White
Write-Host ""
Write-Host "Para DESHABILITAR el auto-inicio, ejecuta:" -ForegroundColor Yellow
Write-Host "  Remove-Item `"$ShortcutPath`"" -ForegroundColor Gray
Write-Host ""
pause
