import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

function createWindow() {
  if (!app.isPackaged) {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#09090b',
    // autoHideMenuBar: true, // Replaced by setMenu(null)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow loading local resources (file://)
    },
  });

  win.setMenu(null); // Completely remove the menu bar

  if (!app.isPackaged) {
    const loadURL = async () => {
      try {
        await win.loadURL('http://127.0.0.1:5173');
        win.webContents.openDevTools();
      } catch (e) {
        console.log('Dev server not ready, retrying in 1s...');
        setTimeout(loadURL, 1000);
      }
    };
    loadURL();
  } else {
    // In production, load the built file
    win.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

// IPC Handlers
ipcMain.on('open-settings', () => {
  const settingsWin = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Settings',
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  settingsWin.setMenu(null);
  
  if (!app.isPackaged) {
    settingsWin.loadURL('http://localhost:5173#settings');
    // settingsWin.webContents.openDevTools();
  } else {
    settingsWin.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'settings' });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
