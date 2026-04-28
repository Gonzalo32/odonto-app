/**
 * set-chrome-printer.js
 *
 * Modifica el archivo de preferencias de Chrome para que la HP LaserJet 1020
 * quede configurada como impresora predeterminada en el dialogo de impresion.
 * De esta forma, --kiosk-printing la usara automaticamente al imprimir.
 *
 * Ejecutar ANTES de abrir Chrome (lo hace el bat automaticamente).
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── 1. Detectar el nombre exacto de la impresora en Windows ─────────────────
let printerName = '';
try {
  printerName = execSync(
    'powershell -NoProfile -Command "(Get-CimInstance Win32_Printer | Where-Object { $_.Default }).Name"',
    { encoding: 'utf8', timeout: 10000 }
  ).trim();
  console.log('[INFO] Impresora predeterminada en Windows:', printerName);
} catch (_) {}

// Si no se detectó o no contiene "1020", buscar una que sí coincida
if (!printerName || !printerName.toLowerCase().includes('1020')) {
  try {
    const all = execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name"',
      { encoding: 'utf8', timeout: 10000 }
    );
    const match = all.split('\n').map(s => s.trim()).find(s => s.toLowerCase().includes('1020'));
    if (match) {
      printerName = match;
      console.log('[INFO] Impresora HP 1020 encontrada:', printerName);
    }
  } catch (_) {}
}

// Fallback si no se encontró nada
if (!printerName) {
  printerName = 'HP LaserJet 1020';
  console.log('[WARN] No se detecto impresora automaticamente, usando:', printerName);
}

// ── 2. Localizar el archivo de preferencias de Chrome ───────────────────────
const localAppData = process.env.LOCALAPPDATA
  || path.join(require('os').homedir(), 'AppData', 'Local');

const prefsPath = path.join(
  localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Preferences'
);

if (!fs.existsSync(prefsPath)) {
  console.log('[WARN] No se encontro el archivo de preferencias de Chrome:', prefsPath);
  process.exit(0);
}

// ── 3. Actualizar la preferencia de impresora ────────────────────────────────
try {
  // Crear un backup antes de modificar
  fs.copyFileSync(prefsPath, prefsPath + '.totem.bak');

  // Leer y parsear
  const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));

  // El valor sticky_settings es un JSON serializado dentro del JSON de prefs
  const stickySettings = JSON.stringify({
    appState: {
      recentDestinations: [{
        id:           printerName,
        origin:       'local',
        account:      '',
        capabilities: {},
        displayName:  printerName,
        extensionId:  ''
      }],
      selectedDestinationId: printerName,
      version: 2
    }
  });

  if (!prefs.print_preview) prefs.print_preview = {};
  prefs.print_preview.sticky_settings = stickySettings;

  // Guardar (Chrome no requiere pretty-print, acepta JSON compacto)
  fs.writeFileSync(prefsPath, JSON.stringify(prefs), 'utf8');

  console.log('[OK] Chrome configurado para imprimir en:', printerName);

} catch (e) {
  // En caso de error, restaurar el backup
  const bak = prefsPath + '.totem.bak';
  if (fs.existsSync(bak)) {
    try { fs.copyFileSync(bak, prefsPath); } catch (_) {}
  }
  console.error('[ERROR] No se pudo actualizar preferencias de Chrome:', e.message);
  process.exit(1);
}
