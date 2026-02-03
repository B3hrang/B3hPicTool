import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Wand2, ImageMinus } from 'lucide-react';

export const RightPanel = () => {
    const { t } = useTranslation();
    const { activeRightActivity } = useAppStore();

    return (
        <div className="w-64 bg-secondary/50 border-l border-zinc-700 flex flex-col h-full z-10 backdrop-blur-sm">
             <div className="h-10 flex items-center px-4 border-b border-zinc-700 bg-secondary/50">
                 <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                     {activeRightActivity === 'upscale' ? 'Upscale Settings' : 'Remove BG'}
                 </span>
             </div>
             
             <div className="p-4 space-y-4 overflow-y-auto flex-1">
                 {activeRightActivity === 'upscale' && (
                     <div className="space-y-4">
                         {/* Mock Controls */}
                         <div className="space-y-2">
                             <label className="text-xs text-zinc-400 font-medium">Upscale Model</label>
                             <select className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 outline-none focus:border-accent">
                                 <option>RealESRGAN-x4</option>
                                 <option>Waifu2x</option>
                             </select>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs text-zinc-400 font-medium">Scale Factor</label>
                             <div className="flex bg-zinc-900 rounded border border-zinc-800 p-1">
                                 {['2x', '4x', '8x'].map(s => (
                                     <button key={s} className="flex-1 text-xs py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                         {s}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}

                 {activeRightActivity === 'removebg' && (
                      <div className="text-center text-zinc-500 text-sm py-8">
                          Coming Soon...
                      </div>
                 )}
             </div>
        </div>
    );
};
