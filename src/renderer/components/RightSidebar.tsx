import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Wand2, X } from 'lucide-react';
import { useAppStore } from '../store';

export const RightSidebar = () => {
    const { t } = useTranslation();
    const { toggleRightSidebar } = useAppStore();

    return (
        <div className="w-64 bg-secondary/30 border-l border-zinc-800 flex flex-col h-full z-10 backdrop-blur-sm">
             <div className="h-10 flex items-center justify-between px-4 border-b border-zinc-800/50 bg-secondary/50">
                 <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('sidebar.features', 'Features')}</span>
                 <button onClick={toggleRightSidebar} className="text-zinc-500 hover:text-white"><X size={14}/></button>
             </div>
             
             <div className="p-2 space-y-1">
                 <div className="p-3 rounded-md bg-accent/10 border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors group">
                     <div className="flex items-center gap-3 text-accent mb-1">
                         <Wand2 size={18} />
                         <span className="font-medium text-sm">Upscale</span>
                     </div>
                     <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Enhance resolution and clarity.</p>
                 </div>
                 
                 {/* Future Tools */}
                 <div className="p-3 rounded-md border border-zinc-800 opacity-50 cursor-not-allowed">
                     <div className="flex items-center gap-3 text-zinc-400 mb-1">
                         <Image size={18} />
                         <span className="font-medium text-sm">Remove BG</span>
                     </div>
                     <p className="text-xs text-zinc-600">Coming soon...</p>
                 </div>
             </div>
        </div>
    );
};
