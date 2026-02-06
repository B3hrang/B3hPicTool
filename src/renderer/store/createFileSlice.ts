import { StateCreator } from 'zustand';
import { AppState, ImageFile, EditorTab } from './types';

export interface FileSlice {
    files: ImageFile[];
    tabs: EditorTab[];
    activeTabId: string | null;

    addFiles: (files: ImageFile[]) => void;
    removeFile: (id: string) => void;
    openTab: (fileId: string, type: 'preview' | 'upscale') => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    updateFileStatus: (id: string, status: ImageFile['status'], processedPreview?: string, progress?: number) => void;
}

export const createFileSlice: StateCreator<AppState, [], [], FileSlice> = (set, get) => ({
    files: [],
    tabs: [],
    activeTabId: null,

    addFiles: (newFiles) => {
        const state = get();
        const currentFiles = state.files;
        const validFiles: ImageFile[] = [];

        newFiles.forEach(file => {
            const normalizedPath = file.path.toLowerCase().replace(/\\/g, '/');
            const exists = currentFiles.some(f =>
                f.path.toLowerCase().replace(/\\/g, '/') === normalizedPath
            );

            if (!exists) {
                validFiles.push(file);
                state.addLog(`File ${file.name} has been added.`, 'info');
            }
        });

        if (validFiles.length > 0) {
            set((state) => ({
                files: [...state.files, ...validFiles]
            }));
        }
    },

    removeFile: (id) => set((state) => {
        const remainingTabs = state.tabs.filter(t => t.fileId !== id);
        const isActiveTabClosed = !remainingTabs.find(t => t.id === state.activeTabId);

        return {
            files: state.files.filter(f => f.id !== id),
            tabs: remainingTabs,
            activeTabId: isActiveTabClosed ? (remainingTabs[remainingTabs.length - 1]?.id || null) : state.activeTabId
        };
    }),

    openTab: (fileId, type) => set((state) => {
        const file = state.files.find(f => f.id === fileId);
        if (!file) return {};

        const existingTab = state.tabs.find(t => t.fileId === fileId && t.type === type);

        if (existingTab) {
            return { activeTabId: existingTab.id };
        }

        const newTab: EditorTab = {
            id: crypto.randomUUID(),
            fileId,
            type,
            title: type === 'upscale' ? `UpScale - ${file.name}` : `Preview - ${file.name}`
        };

        return {
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id
        };
    }),

    closeTab: (tabId) => set((state) => {
        const remainingTabs = state.tabs.filter(t => t.id !== tabId);
        let newActiveId = state.activeTabId;

        if (state.activeTabId === tabId) {
            newActiveId = remainingTabs[remainingTabs.length - 1]?.id || null;
        }

        return { tabs: remainingTabs, activeTabId: newActiveId };
    }),

    setActiveTab: (tabId) => set({ activeTabId: tabId }),

    updateFileStatus: (id, status, processedPreview, progress) => set((state) => ({
        files: state.files.map(f => {
            if (f.id !== id) return f;
            return {
                ...f,
                status,
                processedPreview: processedPreview ?? f.processedPreview,
                progress: progress !== undefined ? progress : (status === 'idle' ? 0 : f.progress)
            };
        })
    })),
});
