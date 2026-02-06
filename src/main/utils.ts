import { app } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';

// SETTINGS MANAGER
export const getSettingsPath = () => join(app.getPath('userData'), 'config.json');

export const loadSettings = async () => {
    if (!app.isReady()) await app.whenReady();

    try {
        const data = await fs.readFile(getSettingsPath(), 'utf-8');
        return JSON.parse(data);
    } catch {
        return {};
    }
};

export const saveSettings = async (settings: any) => {
    await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2));
};

// CACHE UTILS
export const getCachePath = async () => {
    const settings = await loadSettings();
    return settings['cachePath'] || join(app.getPath('temp'), 'B3hSoft', 'B3hPicTool', 'Temp Image');
};

export const ensureCacheDir = async (pathStr: string) => {
    try {
        await fs.access(pathStr);
    } catch {
        await fs.mkdir(pathStr, { recursive: true });
    }
};

// BINARY PATH
export const getBinaryPath = () => {
    const isDev = !app.isPackaged;
    const binName = process.platform === 'win32' ? 'realesrgan-ncnn-vulkan.exe' : 'realesrgan-ncnn-vulkan';
    if (isDev) {
        return join(app.getAppPath(), 'resources/bin', binName);
    }
    return join(process.resourcesPath, 'resources/bin', binName);
};
