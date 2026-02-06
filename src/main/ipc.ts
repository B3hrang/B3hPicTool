import { ipcMain, dialog, BrowserWindow, shell, app } from 'electron';
import { join, dirname, extname, basename } from 'path';
import { promises as fs, constants } from 'fs';
import { spawn } from 'child_process';
import { loadSettings, saveSettings, ensureCacheDir, getBinaryPath, getCachePath } from './utils';

// State to track active upscaling processes
const activeProcesses = new Map();

export function registerIpcHandlers() {
    ipcMain.handle('get-settings', async () => await loadSettings());

    ipcMain.handle('set-setting', async (event, key: string, value: any) => {
        const settings = await loadSettings();
        settings[key] = value;
        await saveSettings(settings);
        return { success: true };
    });

    ipcMain.on('open-settings', () => {
        // This is handled in main.ts or via import if we move createSettingsWindow here. 
        // Ideally we keep window creation in main/windows. 
        // For now, let main.ts listen or we can emit.
        // But previously main.ts listened. Let's leave it to main.ts or re-implement if needed.
        // Actually, main.ts likely calls this register function. 
        // The event listener for 'open-settings' was in main.ts previously. 
        // We will move it here for modularity if we can import createSettingsWindow.
        // To avoid circular deps, let's keep simple handlers here.
    });

    ipcMain.handle('get-cache-stats', async () => {
        try {
            const currentCachePath = await getCachePath();
            await ensureCacheDir(currentCachePath);

            const files = await fs.readdir(currentCachePath);
            let totalSize = 0;

            for (const file of files) {
                const stats = await fs.stat(join(currentCachePath, file));
                totalSize += stats.size;
            }

            return { path: currentCachePath, count: files.length, size: totalSize };
        } catch (e) {
            return { path: '', count: 0, size: 0, error: String(e) };
        }
    });

    ipcMain.handle('clear-cache', async () => {
        try {
            const currentCachePath = await getCachePath();
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

            await ensureCacheDir(newPath);
            return { success: true, path: newPath };
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
                await fs.copyFile(defaultPath, result.filePath);
                return { success: true, filePath: result.filePath };
            } catch (e) {
                return { success: false, error: String(e) };
            }
        }
        return { success: false, canceled: true };
    });

    ipcMain.handle('show-item-in-folder', async (event, filePath) => {
        shell.showItemInFolder(filePath);
    });

    ipcMain.handle('save-file-direct', async (event, { filePath, originalPath }) => {
        try {
            const dir = dirname(originalPath);
            const ext = extname(originalPath);
            const name = basename(originalPath, ext);
            const newFilename = `${name}_upscaled${ext}`;
            const destPath = join(dir, newFilename);

            // Check if exists
            try {
                await fs.access(destPath, constants.F_OK);
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

        return new Promise((resolve) => {
            const child = spawn(binPath, ['-v']);
            let output = '';
            child.stderr.on('data', (d) => output += d.toString());
            child.on('close', () => {
                const gpus: { id: string, name: string }[] = [];
                const lines = output.split('\n');
                lines.forEach(line => {
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

    ipcMain.handle('test-api-key', async (event, { provider, key }) => {
        if (!key || key.trim() === '') {
            return { success: false, error: 'API Key is empty' };
        }

        if (provider === 'gemini') {
            try {
                // Determine API Endpoint based on key or standard Google endpoint
                // Testing with a simple list models call
                const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    return { success: true, message: 'Valid API Key', details: `Found ${data.models?.length || 0} models` };
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    return { success: false, error: `Validation Failed: ${response.status}`, details: JSON.stringify(errorData) };
                }
            } catch (error) {
                return { success: false, error: `Network/Request Error: ${String(error)}` };
            }
        }

        return { success: false, error: 'Unknown provider' };
    });

    ipcMain.on('upscale-image', async (event, { fileId, filePath, options }) => {
        const binPath = getBinaryPath();
        const settings = await loadSettings();
        const currentCachePath = await getCachePath();

        const log = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
            event.reply('upscale-log', { fileId, type, message: msg });
        };

        log(`[Main] Request to upscale: ${basename(filePath)}`);

        try {
            await fs.access(binPath);
        } catch (error) {
            console.error(`Binary not found at ${binPath}`);
            event.reply('upscale-error', { fileId, error: 'Binary not found' });
            return;
        }

        await ensureCacheDir(currentCachePath);

        const ext = extname(filePath);
        const name = basename(filePath, ext);
        const uniqueName = `${name}_${Date.now()}_upscaled${ext}`;
        const outputPath = join(currentCachePath, uniqueName);

        const modelName = options?.variant || 'realesrgan-x4plus';

        const args = [
            '-i', filePath,
            '-o', outputPath,
            '-n', modelName,
            '-s', '4'
        ];

        if (settings['upscaleGpuId'] && settings['upscaleGpuId'].trim() !== '') {
            args.push('-g', settings['upscaleGpuId']);
        }

        log(`[Main] Spawning Process`);
        log(`[Main] Binary: ${binPath}`);
        log(`[Main] Args: ${args.join(' ')}`);

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
                event.reply('upscale-done', { fileId, outputPath });
            } else if (code !== null) {
                event.reply('upscale-error', { fileId, error: `Process failed with code ${code}` });
            }
        });

        activeProcesses.set(fileId, child);
    });
}
