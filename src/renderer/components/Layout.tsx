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

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, leftSidebarOpen, rightSidebarOpen, addFiles } = useAppStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.dir = i18n.dir(); 
  }, [theme, i18n.language]);

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
