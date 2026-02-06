import { StateCreator } from 'zustand';
import { AppState, LogEntry } from './types';

export interface LogSlice {
    isTerminalOpen: boolean;
    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type']) => void;
    toggleTerminal: () => void;
    setTerminalOpen: (isOpen: boolean) => void;
}

export const createLogSlice: StateCreator<AppState, [], [], LogSlice> = (set) => ({
    logs: [],
    isTerminalOpen: false,

    addLog: (message, type = 'info') => set((state) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');

        const formattedMessage = `[${timeStr} ${dateStr}] > ${message}`;

        return {
            logs: [...state.logs, {
                id: crypto.randomUUID(),
                message: formattedMessage,
                type,
                timestamp: `${timeStr} ${dateStr}`
            }],
            isTerminalOpen: type === 'error' ? true : state.isTerminalOpen
        };
    }),

    toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
    setTerminalOpen: (isOpen) => set({ isTerminalOpen: isOpen }),
});
