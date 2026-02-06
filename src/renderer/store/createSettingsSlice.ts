import { StateCreator } from 'zustand';
import { AppState } from './types';

export interface SettingsSlice {
    upscaleModel: string;
    scaleFactor: number;
    upscaleVariant: string;
    upscaleGpuId: string;
    gpus: { id: string, name: string }[];

    // Server & Security (Restored)
    serverEnabled: boolean;
    serverPort: number;
    webSecurity: boolean;
    authToken: string;

    setServerSettings: (enabled: boolean, port: number) => void;
    setSecuritySettings: (enabled: boolean, token: string) => void;

    // API Keys
    geminiApiKey: string;
    setApiKey: (provider: 'gemini', key: string) => void;

    setUpscaleSettings: (model: string, factor: number) => void;
    setUpscaleVariant: (variant: string) => void;
    setGpuId: (id: string) => void;
    setGpus: (gpus: { id: string, name: string }[]) => void;
}

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set) => ({
    upscaleModel: 'RealESRGAN-x4',
    scaleFactor: 4,
    upscaleVariant: 'realesrgan-x4plus',
    upscaleGpuId: '',
    gpus: [],

    serverEnabled: false,
    serverPort: 3000,
    webSecurity: false,
    authToken: '',

    setServerSettings: (serverEnabled, serverPort) => set({ serverEnabled, serverPort }),
    setSecuritySettings: (webSecurity, authToken) => set({ webSecurity, authToken }),

    geminiApiKey: '',
    setApiKey: (provider, key) => {
        if (provider === 'gemini') {
            set({ geminiApiKey: key });
            // Optionally persist here or rely on specific save action
            window.electron.ipcRenderer.invoke('set-setting', 'geminiApiKey', key);
        }
    },

    setUpscaleSettings: (upscaleModel, scaleFactor) => set({ upscaleModel, scaleFactor }),
    setUpscaleVariant: (variant) => set({ upscaleVariant: variant }),

    setGpuId: (id: string) => {
        set({ upscaleGpuId: id });
        window.electron.ipcRenderer.invoke('set-setting', 'upscaleGpuId', id);
    },

    setGpus: (gpus) => set({ gpus }),
});
