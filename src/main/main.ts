import { app, BrowserWindow, ipcMain, dialog } from 'electron';
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
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Keep false for local file loading if needed, or better: use protocol handler. For now, leave as is but warn.
      preload: join(app.getAppPath(), 'dist/preload.js'),
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
    const indexPath = join(app.getAppPath(), 'dist/index.html');
    win.loadFile(indexPath);
    // win.webContents.openDevTools(); // Keep commented out or remove for final build
  }
}

app.whenReady().then(async () => {
    // Initialize Cache Path
    const settings = await loadSettings();
    currentCachePath = settings['cachePath'] || join(app.getPath('temp'), 'B3hSoft', 'B3hPicTool', 'Temp Image');
    
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});

// IPC Handlers
// ... (imports)

// ... imports

// GLOBAL VARIABLES
let currentCachePath = ''; // Will be set on ready
const activeProcesses = new Map();

// SETTINGS MANAGER
const getSettingsPath = () => join(app.getPath('userData'), 'config.json');

const loadSettings = async () => {
    // Ensure app is ready before calling getPath if called early
    if (!app.isReady()) await app.whenReady();
    
    const { promises: fs } = await import('fs');
    try {
        const data = await fs.readFile(getSettingsPath(), 'utf-8');
        return JSON.parse(data);
    } catch {
        return {};
    }
};

const saveSettings = async (settings: any) => {
    const { promises: fs } = await import('fs');
    await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2));
};

// CACHE UTILS
const ensureCacheDir = async (pathStr: string) => {
    const { promises: fs } = await import('fs');
    try {
        await fs.access(pathStr);
    } catch {
        await fs.mkdir(pathStr, { recursive: true });
    }
};

// IPC HANDLERS
ipcMain.handle('get-settings', async () => await loadSettings());

ipcMain.handle('set-setting', async (event, key: string, value: any) => {
    const settings = await loadSettings();
    settings[key] = value;
    await saveSettings(settings);
    return { success: true };
});

ipcMain.on('open-settings', () => {
  const settingsWin = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Settings',
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: join(app.getAppPath(), 'dist/preload.js'),
    },
  });

  settingsWin.setMenu(null);
  
  if (!app.isPackaged) {
    settingsWin.loadURL('http://localhost:5173#settings');
  } else {
    settingsWin.loadFile(join(app.getAppPath(), 'dist/index.html'), { hash: 'settings' });
  }
});

const getBinaryPath = () => {
  const isDev = !app.isPackaged;
  const binName = process.platform === 'win32' ? 'realesrgan-ncnn-vulkan.exe' : 'realesrgan-ncnn-vulkan';
  if (isDev) {
    return join(app.getAppPath(), 'resources/bin', binName);
  }
  return join(process.resourcesPath, 'resources/bin', binName);
};

ipcMain.handle('get-cache-stats', async () => {
    try {
        const { promises: fs } = await import('fs');
        const settings = await loadSettings();
        if (settings['cachePath']) currentCachePath = settings['cachePath'];
        
        await ensureCacheDir(currentCachePath);
        
        const files = await fs.readdir(currentCachePath);
        let totalSize = 0;
        
        for (const file of files) {
            const stats = await fs.stat(join(currentCachePath, file));
            totalSize += stats.size;
        }
        
        return { path: currentCachePath, count: files.length, size: totalSize };
    } catch (e) {
        return { path: currentCachePath, count: 0, size: 0, error: String(e) };
    }
});

ipcMain.handle('clear-cache', async () => {
    try {
        const { promises: fs } = await import('fs');
        const files = await fs.readdir(currentCachePath);
        await Promise.all(
            files.map(file => fs.unlink(join(currentCachePath, file)))
        );
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
});

ipcMain.handle('change-cache-path', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        const newPath = result.filePaths[0];
        const settings = await loadSettings();
        settings['cachePath'] = newPath;
        await saveSettings(settings);
        
        currentCachePath = newPath;
        await ensureCacheDir(currentCachePath);
        return { success: true, path: currentCachePath };
    }
    return { canceled: true };
});

ipcMain.handle('save-file', async (event, { defaultPath }) => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win!, {
        defaultPath: defaultPath,
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'webp'] }]
    });

    if (!result.canceled && result.filePath) {
        try {
            const { promises: fs } = await import('fs');
            await fs.copyFile(defaultPath, result.filePath);
            return { success: true, filePath: result.filePath };
        } catch (e) {
            return { success: false, error: String(e) };
        }
    }
    return { success: false, canceled: true };
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    const { shell } = await import('electron');
    shell.showItemInFolder(filePath);
});

ipcMain.handle('save-file-direct', async (event, { filePath, originalPath }) => {
    try {
        const path = await import('path');
        const { promises: fs } = await import('fs');
        const { constants } = await import('fs');
        
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const name = path.basename(originalPath, ext);
        const newFilename = `${name}_upscaled${ext}`;
        const destPath = path.join(dir, newFilename);

        // Check if exists
        try {
            await fs.access(destPath, constants.F_OK);
            // If we reach here, file exists
            return { success: false, error: 'File exists', code: 'EXISTS', filePath: destPath };
        } catch {
            // File does not exist, proceed
        }

        // Copy overwrite
        await fs.copyFile(filePath, destPath);
        return { success: true, filePath: destPath };
    } catch (e) {
        return { success: false, error: String(e) };
    }
});

ipcMain.handle('get-gpu-list', async () => {
    const binPath = getBinaryPath();
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
        // Run with -h or just run to get device info in stderr
        // Usually -v or empty args triggers the list in stderr logs
        // ncnn vulkan typically prints device list on any init.
        // Let's rely on info being printed to stderr.
        const child = spawn(binPath, ['-v']); // -v might trigger version info + device list? Or -h?
        // Actually ncnn prints to stderr: [0 NVIDIA...]
        
        let output = '';
        child.stderr.on('data', (d) => output += d.toString());
        child.on('close', () => {
             // Parse output
             const gpus: { id: string, name: string }[] = [];
             const lines = output.split('\n');
             lines.forEach(line => {
                 // Match [0 Name]
                 const match = line.match(/^\[(\d+)\s+(.+?)\]/);
                 if (match) {
                     gpus.push({ id: match[1], name: match[2].trim() });
                 }
             });
             resolve(gpus);
        });
        child.on('error', () => resolve([]));
    });
});

ipcMain.on('upscale-image', async (event, { fileId, filePath, options }) => {
  const binPath = getBinaryPath();
  const path = await import('path');
  const settings = await loadSettings();
  
  // Format Log
  const log = (msg: string, type: 'info'|'success'|'error' = 'info') => {
      event.reply('upscale-log', { fileId, type, message: msg });
  };

  log(`[Main] Request to upscale: ${path.basename(filePath)}`);

  try {
    const { promises: fs } = await import('fs');
    await fs.access(binPath);
  } catch (error) {
    console.error(`Binary not found at ${binPath}`);
    event.reply('upscale-error', { fileId, error: 'Binary not found' });
    return;
  }

  await ensureCacheDir(currentCachePath);
  
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  const uniqueName = `${basename}_${Date.now()}_upscaled${ext}`;
  const outputPath = path.join(currentCachePath, uniqueName);

  // Determine Model Name
  // If user selected Anime, use 'realesrgan-x4plus-anime', else default 'realesrgan-x4plus'
  // options object might need to carry this. For now, let's assume store passes it or we read from settings?
  // Actually, 'upscale-image' event receives { options }. We should pass variant there.
  // But wait, renderer calls `ipcRenderer.send('upscale-image', ...)` via `store` or `Layout`? 
  // Let's assume options has it. If not, fallback.
  // We need to update the caller in renderer too!

  // For now, let's check settings.json or options.
  // Let's assume options.variant is passed.
  const modelName = options?.variant || 'realesrgan-x4plus';

  const args = [
    '-i', filePath,
    '-o', outputPath,
    '-n', modelName, 
    '-s', '4' 
  ];

  // GPU ID Logic
  if (settings['upscaleGpuId'] && settings['upscaleGpuId'].trim() !== '') {
      args.push('-g', settings['upscaleGpuId']);
  }

  log(`[Main] Spawning Process`);
  log(`[Main] Binary: ${binPath}`);
  log(`[Main] Args: ${args.join(' ')}`);

  const { spawn } = await import('child_process');
  const child = spawn(binPath, args);

  child.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (!output) return;
    log(`[ESRGAN] ${output}`);
    
    const match = output.match(/(\d+\.\d+)%/);
    if (match) {
        event.reply('upscale-progress', { fileId, progress: parseFloat(match[1]) });
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (!output) return;
    log(`[ESRGAN-STDERR] ${output}`);
    
    const match = output.match(/(\d+\.\d+)%/);
    if (match) {
        event.reply('upscale-progress', { fileId, progress: parseFloat(match[1]) });
    }
  });

  child.on('close', (code) => {
    log(`[Main] Process exited with code ${code}`, code === 0 ? 'success' : 'error');
    activeProcesses.delete(fileId);
    if (code === 0) {
        // Use uniqueName for clear logging if desired, but here we just pass outputPath
        event.reply('upscale-done', { fileId, outputPath });
    } else if (code !== null) {
        event.reply('upscale-error', { fileId, error: `Process failed with code ${code}` });
    }
  });

  activeProcesses.set(fileId, child);
});

// ... (activeProcesses and app lifecycle)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
