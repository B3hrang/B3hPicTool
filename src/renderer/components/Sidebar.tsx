import React from 'react';
import { useAppStore } from '../store';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { X, Image, Settings } from 'lucide-react';
import { FileList } from './FileList';

export const Sidebar = () => {
  const { leftSidebarOpen, toggleLeftSidebar } = useAppStore();
  const { t } = useTranslation();

  if (!leftSidebarOpen) return null;

  return (
    <div className="w-64 bg-secondary/50 border-r border-zinc-800 rtl:border-l rtl:border-r-0 flex flex-col backdrop-blur-sm z-10 transition-all h-full">
      <div className="h-10 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-secondary/30">
        <span>{t('sidebar.project', 'Project Files')}</span>
        <button onClick={toggleLeftSidebar} className="hover:text-foreground">
           <X size={14} />
        </button>
      </div>

      {/* Files Area (Draggable) */}
      <div className="flex-1 overflow-y-auto flex flex-col">
         <FileList />
      </div>

      {/* Bottom Settings Button */}
      <div className="p-2 border-t border-zinc-800/50">
        <button
            onClick={() => {
                const { ipcRenderer } = (window as any).require('electron');
                ipcRenderer.send('open-settings');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
        >
            <Settings size={18} />
            {t('nav.settings', 'Settings')}
        </button>
      </div>
    </div>
  );
};
