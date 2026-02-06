import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../store';

// Mock Electron IPC
const mockInvoke = vi.fn();
// We need to mock window.electron before importing store logic if it uses it immediately,
// but zustand store usually uses it inside actions.
window.electron = {
    ipcRenderer: {
        invoke: mockInvoke,
        send: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
    }
} as any;

describe('AppStore', () => {
    beforeEach(() => {
        useAppStore.setState({
            files: [],
            tabs: [],
            activeTabId: null,
            isFilesPanelOpen: true,
            activeFilesTab: 'files',
            logs: []
        });
        mockInvoke.mockClear();
    });

    it('should add files correctly', () => {
        const newFile = {
            id: '1',
            name: 'test.png',
            path: 'C:/test.png',
            preview: 'blob:test',
            status: 'idle' as const
        };

        useAppStore.getState().addFiles([newFile]);

        expect(useAppStore.getState().files).toHaveLength(1);
        expect(useAppStore.getState().files[0]).toEqual(newFile);
    });

    it('should not add duplicate files', () => {
        const file = {
            id: '1',
            name: 'test.png',
            path: 'C:/test.png',
            preview: 'blob:test',
            status: 'idle' as const
        };

        useAppStore.getState().addFiles([file]);
        useAppStore.getState().addFiles([file]);

        expect(useAppStore.getState().files).toHaveLength(1);
    });

    it('should open a tab when requested', () => {
        const file = {
            id: '1',
            name: 'test.png',
            path: 'C:/test.png',
            preview: 'blob:test',
            status: 'idle' as const
        };
        useAppStore.getState().addFiles([file]);

        useAppStore.getState().openTab('1', 'preview');

        expect(useAppStore.getState().tabs).toHaveLength(1);
        expect(useAppStore.getState().activeTabId).toBeDefined();
        expect(useAppStore.getState().tabs[0].type).toBe('preview');
    });

    it('should switch panels when setting activity tab', () => {
        // Initial state
        expect(useAppStore.getState().activeFilesTab).toBe('files');
        expect(useAppStore.getState().isFilesPanelOpen).toBe(true);

        // Call setFilesTab with same activity -> should toggle close
        useAppStore.getState().setFilesTab('files');
        expect(useAppStore.getState().isFilesPanelOpen).toBe(false);

        // Call setFilesTab with DIFFERENT activity -> should switch and Open
        useAppStore.getState().setFilesTab('settings');
        expect(useAppStore.getState().activeFilesTab).toBe('settings');
        expect(useAppStore.getState().isFilesPanelOpen).toBe(true);
    });
});
