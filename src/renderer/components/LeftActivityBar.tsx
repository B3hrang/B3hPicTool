import React from 'react';
import { useTranslation } from 'react-i18next';
import { Files, Settings } from 'lucide-react';
import { useAppStore } from '../store';
import clsx from 'clsx';

export const LeftActivityBar = () => {
    const { activeLeftActivity, leftSidebarOpen, setLeftActivity } = useAppStore();
    const { t } = useTranslation();

    const openSettings = () => {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('open-settings');
    }

    return (
        <div className="w-12 bg-secondary/80 border-r border-zinc-900 flex flex-col items-center py-4 gap-4 z-20">
            {/* Files Toggle */}
            <div className="relative group">
                <button 
                    onClick={() => setLeftActivity('files')}
                    className={clsx(
                        "p-2 rounded-md transition-all",
                        activeLeftActivity === 'files' && leftSidebarOpen 
                            ? "bg-accent/20 text-accent" 
                            : "text-zinc-500 hover:text-zinc-200"
                    )}
                    title={t('nav.files', 'Files')}
                >
                    <Files size={24} strokeWidth={1.5} />
                </button>
                {/* Active Indicator Line */}
                {activeLeftActivity === 'files' && leftSidebarOpen && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                )}
            </div>

            <div className="flex-1" />

            {/* Settings Button (Bottom) */}
             <button 
                onClick={openSettings}
                className="p-2 text-zinc-500 hover:text-zinc-200 transition-all mb-2"
                title={t('nav.settings', 'Settings')}
            >
                <Settings size={24} strokeWidth={1.5} />
            </button>
        </div>
    );
};
