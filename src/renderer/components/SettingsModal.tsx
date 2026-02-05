import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { X, Trash2, FolderOpen, HardDrive } from 'lucide-react';

export const SettingsModal: React.FC = () => {
    const { isSettingsOpen, toggleSettings } = useAppStore();
    const [cacheStats, setCacheStats] = useState<{ path: string, count: number, size: number } | null>(null);
    const [cacheStats, setCacheStats] = useState<{ path: string, count: number, size: number } | null>(null);

    useEffect(() => {
        if (isSettingsOpen) {
            refreshStats();
        }
    }, [isSettingsOpen]);

    const refreshStats = async () => {
        const stats = await window.electron.ipcRenderer.invoke('get-cache-stats');
        setCacheStats(stats);
    };

    const handleClearCache = async () => {
        const result = await window.electron.ipcRenderer.invoke('clear-cache');
        if (result.success) {
            refreshStats();
        }
    };

    const handleChangePath = async () => {
        const result = await window.electron.ipcRenderer.invoke('change-cache-path');
        if (result.success && result.path) {
            refreshStats();
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSettings}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-[500px] max-w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/50 border-b border-zinc-800">
                    <span className="font-semibold text-zinc-200 text-lg">Settings</span>
                    <button onClick={toggleSettings} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cache Section */}
                    <div>
                        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-3">Temporary Storage & Cache</h3>
                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-md p-4 space-y-4">

                            <div className="flex items-start gap-3">
                                <HardDrive className="text-zinc-500 mt-1" size={18} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-zinc-300 text-sm font-medium mb-1">Cache Location</div>
                                    <div className="text-zinc-500 text-xs font-mono break-all bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                                        {cacheStats?.path || 'Loading...'}
                                    </div>
                                    <button
                                        onClick={handleChangePath}
                                        className="mt-2 text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                                    >
                                        <FolderOpen size={12} /> Change Location
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-800/50" />

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-zinc-400 text-sm">Target Cache Size</span>
                                    <span className="text-zinc-200 font-mono text-lg font-bold">
                                        {cacheStats ? formatSize(cacheStats.size) : '...'}
                                    </span>
                                    <span className="text-zinc-600 text-xs">{cacheStats?.count || 0} files</span>
                                </div>
                                <button
                                    onClick={handleClearCache}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-md transition-colors text-sm border border-red-900/30"
                                >
                                    <Trash2 size={14} />
                                    Clear Cache
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
