export type Theme = 'dark' | 'light' | 'blue';

export interface LogEntry {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    timestamp: string;
}

export interface ImageFile {
    id: string;
    name: string;
    path: string;
    preview: string;
    status: 'idle' | 'processing' | 'done' | 'error';
    originalSize?: number;
    processedPreview?: string;
    progress?: number;
}

export interface EditorTab {
    id: string;
    fileId: string;
    type: 'preview' | 'upscale';
    title: string;
}

export interface AppState {
    // Slices will extend this or be part of it
    theme: Theme;

    isFilesPanelOpen: boolean;
    isToolsPanelOpen: boolean;
    activeFilesTab: 'files' | 'settings';
    activeToolsTab: 'upscale' | 'removebg';
    toggleFilesPanel: () => void;
    toggleToolsPanel: () => void;
    setFilesTab: (activity: 'files' | 'settings') => void;
    setToolsTab: (activity: 'upscale' | 'removebg') => void;
    setTheme: (theme: Theme) => void;

    files: ImageFile[];
    tabs: EditorTab[];
    activeTabId: string | null;
    addFiles: (files: ImageFile[]) => void;
    removeFile: (id: string) => void;
    openTab: (fileId: string, type: 'preview' | 'upscale') => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    updateFileStatus: (id: string, status: ImageFile['status'], processedPreview?: string, progress?: number) => void;

    upscaleModel: string;
    scaleFactor: number;
    upscaleVariant: string;
    upscaleGpuId: string;
    gpus: { id: string, name: string }[];
    setUpscaleSettings: (model: string, factor: number) => void;
    setUpscaleVariant: (variant: string) => void;
    setGpuId: (id: string) => void;
    setGpus: (gpus: { id: string, name: string }[]) => void;

    // Server & Security
    serverEnabled: boolean;
    serverPort: number;
    webSecurity: boolean;
    authToken: string;
    geminiApiKey: string;
    setServerSettings: (enabled: boolean, port: number) => void;
    setSecuritySettings: (enabled: boolean, token: string) => void;
    setApiKey: (provider: 'gemini', key: string) => void;

    isTerminalOpen: boolean;
    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type']) => void;
    toggleTerminal: () => void;
    setTerminalOpen: (isOpen: boolean) => void;

    isSettingsOpen: boolean;
    toggleSettings: () => void;
}
