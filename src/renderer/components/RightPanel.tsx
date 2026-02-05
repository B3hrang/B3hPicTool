import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Wand2, ImageMinus } from 'lucide-react';

export const RightPanel = () => {
    const { t } = useTranslation();
    const {
        activeRightActivity,
        upscaleModel,
        scaleFactor,
        upscaleVariant,
        setUpscaleSettings,
        files,
        activeTabId,
        tabs,
        addLog,
        updateFileStatus
    } = useAppStore();

    const handleStartUpscale = () => {
        // Find active file (either from active tab, or just the first selected, or currently viewing)
        // Since we are moving away from "Tab" based flow for start, let's assume we work on the file visible in Preview.
        const activeTab = tabs.find(t => t.id === activeTabId);
        const fileId = activeTab?.fileId;
        const file = files.find(f => f.id === fileId);

        if (!file) {
            addLog("No file selected to upscale.", 'warning');
            return;
        }

        if (file.status === 'processing') {
            addLog("File is already processing.", 'warning');
            return;
        }

        // Trigger Upscale
        addLog(`Starting upscale for ${file.name} using ${upscaleModel} (${scaleFactor}x)...`, 'info');
        updateFileStatus(file.id, 'processing');

        window.electron.ipcRenderer.send('upscale-image', {
            fileId: file.id,
            filePath: file.path,
            options: { scale: scaleFactor, model: upscaleModel, variant: upscaleVariant }
        });
    };

    return (
        <div className="w-64 bg-secondary/50 border-l border-zinc-700 flex flex-col h-full z-10 backdrop-blur-sm">
            <div className="h-10 flex items-center px-4 border-b border-zinc-700 bg-secondary/50">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {activeRightActivity === 'upscale' ? 'Upscale Settings' : 'Remove BG'}
                </span>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {activeRightActivity === 'upscale' && (
                    <div className="space-y-6">

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-medium">Upscale Model</label>
                            <select
                                value={upscaleModel}
                                onChange={(e) => {
                                    const model = e.target.value;
                                    // Enforce 4x for RealESRGAN-x4
                                    const factor = model.includes('x4') ? 4 : 2;
                                    setUpscaleSettings(model, factor);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 outline-none focus:border-accent"
                            >
                                <option value="RealESRGAN-x4">RealESRGAN-x4</option>
                                <option value="Waifu2x">Waifu2x (Mock)</option>
                            </select>
                        </div>

                        {/* GPU Selection */}
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-medium">GPU Device</label>
                            <select
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-300 outline-none focus:border-accent"
                                onChange={(e) => useAppStore.getState().setGpuId(e.target.value)}
                                value={useAppStore.getState().upscaleGpuId}
                                onClick={async () => {
                                    if (useAppStore.getState().gpus.length === 0) {
                                        const list = await window.electron.ipcRenderer.invoke('get-gpu-list');
                                        useAppStore.getState().setGpus(list || []);
                                    }
                                }}
                            >
                                <option value="">Auto (Default)</option>
                                {useAppStore.getState().gpus.map(gpu => (
                                    <option key={gpu.id} value={gpu.id}>
                                        [{gpu.id}] {gpu.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Scale Factor */}
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 font-medium">Scale Factor</label>
                            <div className="flex bg-zinc-900 rounded border border-zinc-800 p-1">
                                {[2, 4, 8].map(s => (
                                    <button
                                        key={s}
                                        disabled={upscaleModel.includes('x4') && s !== 4}
                                        onClick={() => setUpscaleSettings(upscaleModel, s)}
                                        className={`flex-1 text-xs py-1 rounded transition-colors ${scaleFactor === s
                                            ? 'bg-zinc-700 text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                            } ${upscaleModel.includes('x4') && s !== 4 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                            {upscaleModel.includes('x4') && (
                                <p className="text-[10px] text-zinc-600">RealESRGAN-x4 is fixed to 4x scaling.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeRightActivity === 'removebg' && (
                    <div className="text-center text-zinc-500 text-sm py-8">
                        Coming Soon...
                    </div>
                )}
            </div>

            {/* Bottom Action Area */}
            {activeRightActivity === 'upscale' && (
                <div className="p-4 border-t border-zinc-700">
                    <button
                        onClick={handleStartUpscale}
                        className="w-full bg-accent hover:bg-accent/90 text-white text-xs font-bold py-3 rounded shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Wand2 size={16} />
                        Start Upscaling
                    </button>
                </div>
            )}
        </div>
    );
};
