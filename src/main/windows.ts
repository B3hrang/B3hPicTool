import { app, BrowserWindow } from 'electron';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

export function createMainWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        return;
    }

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#09090b',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // EXPLICITLY DISABLED AS REQUESTED
            preload: join(app.getAppPath(), 'dist/preload.js'),
        },
    });

    win.setMenu(null);
    mainWindow = win;

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
        const indexPath = join(app.getAppPath(), 'dist/index.html');
        win.loadFile(indexPath);
    }
}

export function createSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        if (settingsWindow.isMinimized()) settingsWindow.restore();
        settingsWindow.focus();
        return;
    }

    const win = new BrowserWindow({
        width: 900,
        height: 700,
        title: 'Settings',
        backgroundColor: '#09090b',
        autoHideMenuBar: true,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // EXPLICITLY DISABLED AS REQUESTED
            preload: join(app.getAppPath(), 'dist/preload.js'),
        },
    });

    win.setMenu(null);
    settingsWindow = win;

    if (!app.isPackaged) {
        win.loadURL('http://localhost:5173#settings');
    } else {
        win.loadFile(join(app.getAppPath(), 'dist/index.html'), { hash: 'settings' });
    }
}
