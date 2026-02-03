import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Download, Sliders, Play, Loader2, ZoomIn, ZoomOut, Check, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ImageEditor: React.FC = () => {
  const { files, activeTabId, tabs, updateFileStatus } = useAppStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const file = files.find(f => f.id === activeTab?.fileId);
  
  const [zoom, setZoom] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  if (!file) return null;

  const handleUpscale = () => {
    updateFileStatus(file.id, 'processing');
    
    // Mock processing delay
    setTimeout(() => {
      // For mock, we just use the original image as the "processed" one but maybe apply a CSS filter to differentiate if needed globally
      // In a real app we would get a new URL. here we just pretend.
      updateFileStatus(file.id, 'done', file.preview);
    }, 2500);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
       setZoom(z => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/50 relative overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900/50 backdrop-blur">
        <div className="flex items-center gap-4 text-sm text-zinc-400">
           <span className="font-semibold text-zinc-200">{file.name}</span>
           <div className="h-4 w-px bg-zinc-700 mx-2"></div>
           <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => z - 0.1)} className="p-1 hover:text-white"><ZoomOut size={16}/></button>
              <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => z + 0.1)} className="p-1 hover:text-white"><ZoomIn size={16}/></button>
           </div>
        </div>

        <div className="flex items-center gap-2">
          {file.status === 'done' && (
             <button 
               onClick={() => setCompareMode(!compareMode)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${compareMode ? 'bg-accent text-zinc-950 font-bold' : 'bg-secondary hover:bg-zinc-700'}`}
             >
               <ArrowRightLeft size={16} /> Compare
             </button>
          )}

          {file.status === 'idle' && (
            <button 
              onClick={handleUpscale}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-medium text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              <Play size={16} fill="currentColor" /> Upscale 4x
            </button>
          )}
          
          {file.status === 'processing' && (
            <div className="flex items-center gap-2 bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded font-medium text-sm cursor-wait">
              <Loader2 size={16} className="animate-spin" /> Processing...
            </div>
          )}

           {file.status === 'done' && (
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded font-medium text-sm transition-all shadow-lg shadow-green-500/20">
              <Download size={16} /> Save
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[url('https://transparenttextures.com/patterns/dark-matter.png')] p-8" onWheel={handleWheel}>
        <motion.div 
           className="relative shadow-2xl shadow-black/50"
           style={{ scale: zoom }}
           drag
           dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
        >
           {/* Base Image */}
           <img 
             src={file.preview} 
             alt="Original" 
             className="max-w-[80vw] max-h-[70vh] rounded-sm pointer-events-none select-none block" 
             draggable={false}
           />

           {/* Comparison Overlay (If Done & Mode Active) */}
           <AnimatePresence>
             {compareMode && file.status === 'done' && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 overflow-hidden rounded-sm"
                 style={{ width: `${sliderPos}%`, borderRight: '2px solid white' }}
               >
                 {/* Simulate "Better" image with CSS filters for Mock */}
                 <img 
                   src={file.preview} 
                   className="w-full h-full object-cover filter contrast-125 saturate-150 brightness-110 blur-[0.2px]" 
                   style={{ width: '100vw', maxWidth: 'none', height: '100%' }} // Hack to keep alignment? No, this will break if not careful.
                   alt="Processed"
                   draggable={false}
                 />
                 {/* Actually, correct comparison requires rendering the image at full size in the container.
                     For mock, we just duplicate the img tag. 
                     Also, object-fit contain might mess up overlay alignment. 
                     Better: Use background image. 
                  */}
               </motion.div>
             )}
           </AnimatePresence>
           
        </motion.div>
        
        {/* Comparison Slider Handle (Floating UI, simpler than implementing drag inside the scaled div) */}
        {compareMode && file.status === 'done' && (
           <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
              <div className="bg-black/70 backdrop-blur text-white px-4 py-1 rounded-full text-xs pointer-events-auto">
                 Slide to compare (Mock) <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="align-middle ml-2"/>
              </div>
           </div>
        )}
      </div>

    </div>
  );
};
