import { app, ipcMain } from 'electron';
import { createMainWindow, createSettingsWindow } from './windows';
import { registerIpcHandlers } from './ipc';
import { loadSettings, getCachePath, ensureCacheDir } from './utils';

// Increase performance
if (!app.isPackaged) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

app.whenReady().then(async () => {
  // Initialize
  const settings = await loadSettings();
  const cachePath = settings['cachePath'] || await getCachePath(); // Ensure default if null
  await ensureCacheDir(cachePath);

  // Register IPC
  registerIpcHandlers();

  // Legacy/Window specific IPC that wasn't moved to ipc.ts yet
  ipcMain.on('open-settings', () => {
    createSettingsWindow();
  });

  // NO Custom Protocol needed as we disabled webSecurity

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // createWindow handled by windows.ts singleton check, but we need to call it
  // Actually windows.ts / createMainWindow export handles its own singleton check
  createMainWindow();
});
