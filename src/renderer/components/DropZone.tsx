import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';

export const DropZone: React.FC = () => {
  const { t } = useTranslation();
  const { addFiles } = useAppStore();

  /* 
     Restored local DropZone functionality as per user request.
     Global listener is removed, so this must handle drops.
  */
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      path: (file as any).path, // Electron exposes path
      preview: URL.createObjectURL(file), // Create object URL for preview
      status: 'idle' as const,
      originalSize: file.size
    }));
    addFiles(newFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    },
    noClick: false,
    noKeyboard: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        w-full h-full flex flex-col items-center justify-center 
        border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
        ${isDragActive ? 'border-accent bg-accent/10' : 'border-zinc-700 hover:border-zinc-500 bg-secondary/30 hover:bg-secondary/50'}
      `}
    >
      <input {...getInputProps()} />
      <div className="p-8 rounded-full bg-secondary/50 mb-6 ring-1 ring-white/5">
        <Upload size={48} className={`text-zinc-400 ${isDragActive ? 'text-accent animate-bounce' : ''}`} />
      </div>
      <h3 className="text-xl font-medium text-foreground mb-2">
        {isDragActive ? t('dropzone.active', 'Drop files now') : t('dropzone.idle', 'Drag & Drop images here')}
      </h3>
      <p className="text-zinc-500 text-sm">
        {t('dropzone.subtitle', 'or click to browse from your computer')}
      </p>
      <div className="mt-6 flex gap-2 text-xs text-zinc-600 font-mono">
        <span className="bg-secondary px-2 py-1 rounded">JPG</span>
        <span className="bg-secondary px-2 py-1 rounded">PNG</span>
        <span className="bg-secondary px-2 py-1 rounded">WEBP</span>
      </div>
    </div>
  );
};
