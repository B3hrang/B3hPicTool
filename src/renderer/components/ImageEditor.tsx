import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Download, Sliders, Play, Loader2, ZoomIn, ZoomOut, Check, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Separated component to avoid re-creation on every render which resets state/events
const PanZoomImageViewer = ({ src, label, isOriginal = false }: { src: string, label: string, isOriginal?: boolean }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = React.useRef({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with Scroll
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.max(0.1, Math.min(10, zoom + scaleAmount));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex-1 relative overflow-hidden bg-[url('https://transparenttextures.com/patterns/dark-matter.png')] select-none cursor-move border-r border-zinc-800 last:border-r-0"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded text-xs font-bold shadow-lg ${isOriginal ? 'bg-zinc-800/80 text-zinc-300' : 'bg-accent/80 text-white'}`}>
        {label}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1 text-zinc-300 z-10">
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.1, z - 0.1)); }} className="hover:text-white p-1"><ZoomOut size={14} /></button>
        <span className="text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(10, z + 0.1)); }} className="hover:text-white p-1"><ZoomIn size={14} /></button>
      </div>

      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="origin-center will-change-transform"
        >
          <img
            src={src}
            className="max-w-[80vw] max-h-[80vh] object-contain shadow-2xl pointer-events-none"
            draggable={false}
            alt={label}
          />
        </div>
      </div>
    </div>
  );
};

export const ImageEditor: React.FC = () => {
  const { files, activeTabId, tabs, updateFileStatus, addLog } = useAppStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const file = files.find(f => f.id === activeTab?.fileId);

  // Moved local state (zoom, pan) into PanZoomImageViewer to be independent per view

  if (!file) return null;

  const handleSave = async () => {
    if (!file.processedPreview) return;
    try {
      const result = await window.electron.ipcRenderer.invoke('save-file', {
        defaultPath: file.processedPreview
      });
      if (result.success) {
        addLog(`File saved to ${result.filePath}`, 'success');
      }
    } catch (err) {
      console.error('Save failed:', err);
      addLog(`Save failed: ${err}`, 'error');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/50 relative overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900/50 backdrop-blur">
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{file.name}</span>
          <div className="h-4 w-px bg-zinc-700 mx-2"></div>
          <span className="text-xs text-zinc-500">(Scroll to Zoom, Drag to Pan)</span>
        </div>

        <div className="flex items-center gap-2">
          {file.status === 'processing' && (
            <div className="flex items-center gap-2 bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded font-medium text-sm cursor-wait">
              <Loader2 size={16} className="animate-spin" /> Processing...
            </div>
          )}

          {file.status === 'done' && (
            <div className="flex items-center gap-2">
              {/* Save Direct - Primary Action */}
              <button
                onClick={async () => {
                  if (!file.processedPreview) return;
                  const result = await window.electron.ipcRenderer.invoke('save-file-direct', {
                    filePath: file.processedPreview,
                    originalPath: file.path
                  });
                  if (result.success) {
                    addLog(`File saved to ${result.filePath}`, 'success');
                  } else if (result.code === 'EXISTS') {
                    addLog(`File already exists. Use 'Save As' to overwrite.`, 'warning');
                  } else {
                    addLog(`Save failed: ${result.error}`, 'error');
                  }
                }}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md font-medium text-xs transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
                title="Save to original folder"
              >
                <Download size={14} /> Save
              </button>

              {/* Save As - Secondary Action */}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-md font-medium text-xs transition-all border border-zinc-700 whitespace-nowrap"
                title="Save as..."
              >
                <Download size={14} /> Save As...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Scenario 1: PREVIEW TAB (or Idle) - Show Only Original */}
        {activeTab?.type === 'preview' && (
          <PanZoomImageViewer src={file.preview} label="Original" isOriginal />
        )}

        {/* Scenario 2: UPSCALE TAB - Show Comparison if Done */}
        {activeTab?.type === 'upscale' && file.status === 'done' && file.processedPreview && (
          <>
            <PanZoomImageViewer src={file.preview} label="Original" isOriginal />
            <PanZoomImageViewer src={file.processedPreview} label="Upscaled" />
          </>
        )}

        {/* Fallback/Error state in Upscale tab if something weird happens */}
        {activeTab?.type === 'upscale' && (!file.processedPreview || file.status !== 'done') && (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Waiting for upscaled result...
          </div>
        )}
      </div>
    </div>
  );
};
