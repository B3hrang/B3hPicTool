import React from 'react';
import { useAppStore } from '../store';
import { X, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const FileList: React.FC = () => {
  const { files, removeFile, openTab, tabs, activeTabId } = useAppStore();

  // Helper to check if file is active
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isFileActive = (fileId: string) => activeTab?.fileId === fileId;

  if (files.length === 0) return null;

  if (files.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1 p-2">
      {files.map(file => (
        <div 
          key={file.id}
          onDoubleClick={() => openTab(file.id, 'preview')}
          className={clsx(
            "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border border-transparent",
            isFileActive(file.id) ? "bg-accent/10 border-accent/20" : "hover:bg-zinc-800/50"
          )}
        >
          <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
             <img src={file.preview} alt={file.name} className="w-full h-full object-cover" draggable={false} />
             {file.status === 'processing' && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                 <Loader2 size={14} className="animate-spin text-accent" />
               </div>
             )}
             {file.status === 'done' && (
               <div className="absolute bottom-0 right-0 bg-green-500/90 p-0.5 rounded-tl-sm">
                 <CheckCircle size={8} className="text-white" />
               </div>
             )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={clsx("text-sm font-medium truncate", isFileActive(file.id) ? "text-accent" : "text-zinc-300")}>
              {file.name}
            </div>
            <div className="text-xs text-zinc-500 truncate">
               {file.status === 'idle' ? 'Ready' : file.status === 'processing' ? 'Upscaling...' : 'Done'}
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all text-zinc-500"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
