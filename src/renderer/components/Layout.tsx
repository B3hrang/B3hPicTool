import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { LeftActivityBar } from './LeftActivityBar';
import { RightActivityBar } from './RightActivityBar';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { TabBar } from './TabBar';
import { StatusBar } from './StatusBar';
import { Terminal } from './Terminal';
import { SettingsModal } from './SettingsModal';

// Removed Layout logic change for now, going to modify Terminal.tsx directly to handle resize.
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, leftSidebarOpen, rightSidebarOpen, addFiles, updateFileStatus, addLog } = useAppStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.dir = i18n.dir();
  }, [theme, i18n.language]);

  // Global IPC Listeners for Upscale Progress
  useEffect(() => {
    const onProgress = ({ fileId, progress }: any) => {
      // console.log(`Progress: ${progress}`);
      updateFileStatus(fileId, 'processing', undefined, progress);

      // Throttle logs: Log only every 20-25% to avoid spamming the user's terminal
      if (progress % 20 === 0 && progress > 0 && progress < 100) {
        addLog(`Upscaling... ${progress}%`, 'info');
      }
    };

    const onDone = ({ fileId, outputPath }: any) => {
      updateFileStatus(fileId, 'done', outputPath, 100);

      const file = useAppStore.getState().files.find(f => f.id === fileId);
      const name = file ? file.name : fileId;
      addLog(`Upscale complete for file: ${name}`, 'success');

      // Auto-Open the upscaled tab (which is technically the preview/editor tab now showing side-by-side)
      useAppStore.getState().openTab(fileId, 'upscale');
    };

    const onError = ({ fileId, error }: any) => {
      updateFileStatus(fileId, 'error', undefined);
      addLog(`Upscale error: ${error}`, 'error');
    };

    const onLog = ({ fileId, type, message }: any) => {
      addLog(message, type);
    };

    window.electron.ipcRenderer.on('upscale-progress', onProgress);
    window.electron.ipcRenderer.on('upscale-done', onDone);
    window.electron.ipcRenderer.on('upscale-error', onError);
    window.electron.ipcRenderer.on('upscale-log', onLog);

    return () => {
      window.electron.ipcRenderer.removeAllListeners('upscale-progress');
      window.electron.ipcRenderer.removeAllListeners('upscale-done');
      window.electron.ipcRenderer.removeAllListeners('upscale-error');
      window.electron.ipcRenderer.removeAllListeners('upscale-log');
    };
  }, []);

  // Global Drag & Drop Handler Removed as per user request
  // We will handle it in specific components (LeftPanel and DropZone)

  return (
    <div className={clsx(
      "flex flex-col h-screen w-screen overflow-hidden text-foreground bg-background transition-colors duration-300",
      theme === 'dark' ? "dark" : "",
    )}>
      {/* Top/Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. Left Activity Bar */}
        <LeftActivityBar />

        {/* 2. Left Panel (Files) */}
        {leftSidebarOpen && <LeftPanel />}

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col border-zinc-700 border-r border-l min-w-0 bg-background/50 isolate z-0 relative mx-1">
          <TabBar />
          <main className="flex-1 overflow-auto p-4 relative">
            {children}
          </main>
          <Terminal />
        </div>

        {/* 4. Right Panel (Features) */}
        {rightSidebarOpen && <RightPanel />}

        {/* 5. Right Activity Bar */}
        <RightActivityBar />
      </div>


      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};
