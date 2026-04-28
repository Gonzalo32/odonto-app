const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let printerName = '';
try {
  printerName = execSync(
    'powershell -NoProfile -Command "(Get-CimInstance Win32_Printer | Where-Object { $_.Default }).Name"',
    { encoding: 'utf8', timeout: 10000 }
  ).trim();
  console.log('[INFO] Impresora predeterminada en Windows:', printerName);
} catch (_) {}

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

if (!printerName) {
  printerName = 'HP LaserJet 1020';
  console.log('[WARN] No se detecto impresora automaticamente, usando:', printerName);
}

const localAppData = process.env.LOCALAPPDATA
  || path.join(require('os').homedir(), 'AppData', 'Local');

const prefsPath = path.join(
  localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Preferences'
);

if (!fs.existsSync(prefsPath)) {
  console.log('[WARN] No se encontro el archivo de preferencias de Chrome:', prefsPath);
  process.exit(0);
}

try {
  fs.copyFileSync(prefsPath, prefsPath + '.totem.bak');

  const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));

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

  fs.writeFileSync(prefsPath, JSON.stringify(prefs), 'utf8');

  console.log('[OK] Chrome configurado para imprimir en:', printerName);

} catch (e) {
  const bak = prefsPath + '.totem.bak';
  if (fs.existsSync(bak)) {
    try { fs.copyFileSync(bak, prefsPath); } catch (_) {}
  }
  console.error('[ERROR] No se pudo actualizar preferencias de Chrome:', e.message);
  process.exit(1);
}
