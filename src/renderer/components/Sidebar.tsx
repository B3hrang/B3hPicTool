import { useAppStore } from '../store';
import { useTranslation } from 'react-i18next';
import { X, Settings } from 'lucide-react';
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

      {/* Model Settings (Quick Access) */}
      <div className="px-3 py-2 border-t border-zinc-800/50 space-y-2">
        {/* Only show if RealESRGAN is selected (which is default now) */}
        {useAppStore.getState().upscaleModel === 'RealESRGAN-x4' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 font-medium uppercase">Model Type</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:border-accent outline-none"
              onChange={(e) => useAppStore.getState().setUpscaleVariant(e.target.value)}
              defaultValue={useAppStore.getState().upscaleVariant}
            >
              <option value="realesrgan-x4plus">General (Photo)</option>
              <option value="realesrgan-x4plus-anime">Anime / Art</option>
            </select>
          </div>
        )}
      </div>

      {/* Bottom Settings Button */}
      <div className="p-2 border-t border-zinc-800/50">
        <button
          onClick={() => {
            window.electron.ipcRenderer.send('open-settings');
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
