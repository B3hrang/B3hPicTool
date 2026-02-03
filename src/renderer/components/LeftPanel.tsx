import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { FileList } from './FileList';

export const LeftPanel = () => {
  const { t } = useTranslation();
  const { activeLeftActivity, addFiles } = useAppStore();

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
             id: crypto.randomUUID(),
             name: file.name,
             path: (file as any).path,
             preview: URL.createObjectURL(file),
             status: 'idle' as const
          }));
          addFiles(droppedFiles);
      }
  };

  return (
    <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-64 bg-secondary/50 border-r border-zinc-700 flex flex-col backdrop-blur-sm z-10 transition-all h-full"
    >
       <div className="h-10 flex items-center px-4 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-secondary/30">
        <span>{activeLeftActivity === 'files' ? t('sidebar.files', 'Explorer') : '...'}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col">
         {activeLeftActivity === 'files' && <FileList />}
      </div>
    </div>
  );
};
