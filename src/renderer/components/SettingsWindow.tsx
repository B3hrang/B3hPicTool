import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Monitor, Palette, Key, Shield, User } from 'lucide-react';

export const SettingsWindow = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

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
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === tab.id 
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
           <h1 className="text-3xl font-bold mb-8 capitalize">{activeTab} Settings</h1>

           {activeTab === 'general' && (
             <div className="space-y-6">
                {/* General Settings Placeholders */}
                <div className="p-4 bg-secondary/20 rounded-lg border border-zinc-800">
                   <h3 className="font-semibold mb-2">Application Language</h3>
                   <select className="bg-zinc-900 border border-zinc-700 rounded p-2 w-full">
                      <option value="en">English (US)</option>
                      <option value="fa">فارسی (Persian)</option>
                   </select>
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
