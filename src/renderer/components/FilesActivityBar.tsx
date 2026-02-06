import { useTranslation } from 'react-i18next';
import { Files, Settings } from 'lucide-react';
import { useAppStore } from '../store';
import clsx from 'clsx';

export const FilesActivityBar = () => {
    const { activeFilesTab, isFilesPanelOpen, setFilesTab, toggleSettings } = useAppStore();
    const { t } = useTranslation();

    const openSettings = () => {
        toggleSettings();
    }

    return (
        <div className="w-12 bg-secondary/80 border-l border-zinc-900 flex flex-col items-center py-4 gap-4 z-20">
            {/* Files Toggle */}
            <div className="relative group">
                <button
                    onClick={() => setFilesTab('files')}
                    className={clsx(
                        "p-2 rounded-md transition-all",
                        activeFilesTab === 'files' && isFilesPanelOpen
                            ? "bg-accent/20 text-accent"
                            : "text-zinc-500 hover:text-zinc-200"
                    )}
                    title={t('nav.files', 'Files')}
                >
                    <Files size={24} strokeWidth={1.5} />
                </button>
                {/* Active Indicator Line */}
                {activeFilesTab === 'files' && isFilesPanelOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full" />
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
