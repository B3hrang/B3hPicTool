import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Monitor, Palette, Key, Shield, User, HardDrive, FolderOpen, Trash2 } from 'lucide-react';

export const SettingsWindow = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [cacheStats, setCacheStats] = useState<{ path: string, count: number, size: number } | null>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'storage', label: 'Storage & Cache', icon: HardDrive },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    // { id: 'account', label: 'Account', icon: User },
    // { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => {
    if (activeTab === 'storage') {
      refreshStats();
    }
  }, [activeTab]);

  const refreshStats = async () => {
    try {
      const stats = await window.electron.ipcRenderer.invoke('get-cache-stats');
      setCacheStats(stats);
    } catch (e) {
      console.error("Failed to load cache stats", e);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("Are you sure you want to delete all temporary files?")) return;
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

  return (
    <div className={`h-screen w-screen bg-background text-foreground flex overflow-hidden theme-${theme} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Settings Sidebar */}
      <div className="w-64 bg-secondary/30 border-r border-zinc-800 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6 px-2 text-zinc-100">{t('settings.title', 'Settings')}</h2>
        <div className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h1>

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/20 rounded-lg border border-zinc-800">
                <h3 className="font-semibold mb-2">Application Language</h3>
                <select className="bg-zinc-900 border border-zinc-700 rounded p-2 w-full">
                  <option value="en">English (US)</option>
                  {/* <option value="fa">فارسی (Persian)</option> */}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-md p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-900 rounded-full">
                    <HardDrive className="text-accent" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-200 text-base font-medium mb-1">Cache Location</div>
                    <div className="text-zinc-400 text-sm mb-3">
                      This folder is used to store temporary images during upscaling processes.
                    </div>
                    <div className="text-zinc-500 text-xs font-mono break-all bg-zinc-900 p-3 rounded border border-zinc-800 flex items-center justify-between">
                      <span>{cacheStats?.path || 'Loading...'}</span>
                    </div>
                    <button
                      onClick={handleChangePath}
                      className="mt-3 text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-medium transition-colors"
                    >
                      <FolderOpen size={14} /> Change Location
                    </button>
                  </div>
                </div>

                <div className="h-px bg-zinc-800" />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium">Target Cache Size</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-zinc-100 font-mono text-2xl font-bold">
                        {cacheStats ? formatSize(cacheStats.size) : '...'}
                      </span>
                      <span className="text-zinc-500 text-sm">{cacheStats?.count || 0} files</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md transition-colors text-sm border border-red-500/20"
                  >
                    <Trash2 size={16} />
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/20 rounded-lg border border-zinc-800">
                <h3 className="font-semibold mb-4">Theme</h3>
                <div className="flex gap-4">
                  {['dark', 'light', 'blue'].map(t => (
                    <div
                      key={t}
                      onClick={() => setTheme(t as any)}
                      className={`
                             cursor-pointer w-24 h-16 rounded border-2 flex items-center justify-center capitalize font-medium
                             ${theme === t ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'}
                           `}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/20 rounded-lg border border-zinc-800">
                <h3 className="font-semibold mb-2">Gemini API Key</h3>
                <p className="text-sm text-zinc-500 mb-4">Pro features require a valid Google Gemini API key.</p>
                <input type="password" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:ring-2 ring-accent outline-none" placeholder="sk-..." />
                <div className="mt-2 text-xs text-accent cursor-pointer hover:underline">Get your API key here &rarr;</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
