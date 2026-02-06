import { StateCreator } from 'zustand';
import { AppState, Theme } from './types';

export interface LayoutSlice {
    theme: Theme;
    isFilesPanelOpen: boolean;
    isToolsPanelOpen: boolean;
    activeFilesTab: 'files' | 'settings';
    activeToolsTab: 'upscale' | 'removebg';
    isSettingsOpen: boolean;

    setTheme: (theme: Theme) => void;
    toggleFilesPanel: () => void;
    toggleToolsPanel: () => void;
    setFilesTab: (activity: 'files' | 'settings') => void;
    setToolsTab: (activity: 'upscale' | 'removebg') => void;
    toggleSettings: () => void;
}

export const createLayoutSlice: StateCreator<AppState, [], [], LayoutSlice> = (set) => ({
    theme: 'dark',
    isFilesPanelOpen: true,
    isToolsPanelOpen: true,
    activeFilesTab: 'files',
    activeToolsTab: 'upscale',
    isSettingsOpen: false,

    setTheme: (theme) => set({ theme }),

    toggleFilesPanel: () => set((state) => ({ isFilesPanelOpen: !state.isFilesPanelOpen })),
    toggleToolsPanel: () => set((state) => ({ isToolsPanelOpen: !state.isToolsPanelOpen })),

    setFilesTab: (activity) => set((state) => ({
        activeFilesTab: activity,
        isFilesPanelOpen: state.activeFilesTab === activity ? !state.isFilesPanelOpen : true
    })),

    setToolsTab: (activity) => set((state) => ({
        activeToolsTab: activity,
        isToolsPanelOpen: state.activeToolsTab === activity ? !state.isToolsPanelOpen : true
    })),

    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
});
