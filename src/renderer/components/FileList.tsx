import React from 'react';
import { useAppStore } from '../store';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

export const FileList: React.FC = () => {
  const { files, removeFile, openTab, tabs, activeTabId, addLog } = useAppStore();
  const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, fileId: string } | null>(null);
  const [propertiesModal, setPropertiesModal] = React.useState<typeof files[0] | null>(null);

  // Helper to check if file is active
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isFileActive = (fileId: string) => activeTab?.fileId === fileId;

  // Handle global click to close context menu
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    // Safety check for boundaries
    const x = Math.min(e.clientX, window.innerWidth - 220); // 220px est width
    const y = Math.min(e.clientY, window.innerHeight - 300); // 300px est height
    setContextMenu({ x, y, fileId });
  };

  const handleAction = async (action: string) => {
    if (!contextMenu) return;
    const file = files.find(f => f.id === contextMenu.fileId);
    if (!file) return;

    switch (action) {
      case 'preview':
        openTab(file.id, 'preview');
        break;
      case 'upscale':
        openTab(file.id, 'upscale');
        break;
      case 'save':
      case 'export':
        if (file.processedPreview) {
          const result = await window.electron.ipcRenderer.invoke('save-file', { defaultPath: file.processedPreview });
          if (result.success) {
            addLog(`Saved to ${result.filePath}`, 'success');
            window.electron.ipcRenderer.invoke('show-item-in-folder', result.filePath);
          }
        }
        break;
      case 'remove':
        removeFile(file.id);
        break;
      case 'properties':
        setPropertiesModal(file);
        break;
    }
  };

  if (files.length === 0) return null;

  const renderStatus = (file: typeof files[0]) => {
    if (file.status === 'idle') return <span className="text-zinc-500">Ready to Edit</span>;
    if (file.status === 'done') return <span className="text-green-500">Upscaled Successfully</span>;
    if (file.status === 'error') return <span className="text-red-500">Error</span>;

    if (file.status === 'processing') {
      const p = Math.round(file.progress || 0);
      return (
        <div className="flex flex-col gap-1 w-full mt-1">
          <div className="flex justify-between text-[10px] text-accent">
            <span>Upscaling...</span>
            <span>{p}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${p}%` }}
            />
          </div>
        </div>
      );
    }
  };

  const targetFile = contextMenu ? files.find(f => f.id === contextMenu.fileId) : null;

  return (
    <>
      <div className="w-full flex flex-col gap-1 p-2">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => {
              // Just highlight? Or maybe open preview? 
              // User said: "Preview must be double click... not click empty"
              // But we need to know which file is selected for context/highlight
              // Let's treat click as selection, but we don't have direct selection state other than activeTab.
              // For now, let's keep it simple: Click does nothing logic-wise unless we have selection state.
              // But previous code opened tab. Removing that.
            }}
            onDoubleClick={() => openTab(file.id, 'preview')}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
            className={clsx(
              "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border border-transparent select-none",
              isFileActive(file.id) || contextMenu?.fileId === file.id ? "bg-accent/10 border-accent/20" : "hover:bg-zinc-800/50"
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
              <div className="min-w-0 flex-1">
                <div className={clsx("text-sm font-medium truncate", isFileActive(file.id) ? "text-accent" : "text-zinc-300")}>
                  {file.name}
                </div>
                <div className="text-[10px] font-mono mt-0.5">
                  {renderStatus(file)}
                </div>
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

      {/* Context Menu Portal */}
      {contextMenu && targetFile && createPortal(
        <div
          className="fixed z-[100] bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 w-48 text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 border-b border-zinc-800 mb-1 truncate">
            {targetFile.name}
          </div>
          <button onClick={() => handleAction('preview')} className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2">
            Open Preview
          </button>
          <button
            disabled={targetFile.status !== 'done'}
            onClick={() => handleAction('upscale')}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open Upscaled
          </button>
          <div className="h-px bg-zinc-800 my-1" />
          <button
            disabled={targetFile.status !== 'done'}
            onClick={() => handleAction('save')}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save a Copy
          </button>
          <button
            disabled={targetFile.status !== 'done'}
            onClick={() => handleAction('export')}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export as...
          </button>
          <div className="h-px bg-zinc-800 my-1" />
          <button onClick={() => handleAction('remove')} className="w-full text-left px-3 py-1.5 hover:bg-red-900/50 text-red-400 hover:text-red-300 flex items-center gap-2">
            Remove
          </button>
          <div className="h-px bg-zinc-800 my-1" />
          <button onClick={() => handleAction('properties')} className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2">
            Properties
          </button>
        </div>,
        document.body
      )}

      {/* Properties Modal Portal */}
      {propertiesModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPropertiesModal(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-80 max-w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/50 border-b border-zinc-800">
              <span className="font-semibold text-zinc-200">Properties</span>
              <button onClick={() => setPropertiesModal(null)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500">Name:</span>
                <span className="col-span-2 text-zinc-300 truncate font-mono select-all">{propertiesModal.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500">Status:</span>
                <span className="col-span-2 text-zinc-300">{propertiesModal.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500">Path:</span>
                <span className="col-span-2 text-zinc-300 truncate font-mono select-all" title={propertiesModal.path}>{propertiesModal.path}</span>
              </div>
              {propertiesModal.processedPreview && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-zinc-500">Output:</span>
                  <span className="col-span-2 text-zinc-300 truncate font-mono select-all" title={propertiesModal.processedPreview}>{propertiesModal.processedPreview}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-zinc-950/30 border-t border-zinc-800 flex justify-end">
              <button onClick={() => setPropertiesModal(null)} className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
