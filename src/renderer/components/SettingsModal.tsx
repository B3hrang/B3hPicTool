import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Theme } from '../store/types';
import clsx from 'clsx';
import { Settings as SettingsIcon, Cpu, HardDrive, X, FolderOpen, Trash2, Shield, Globe } from 'lucide-react';

type SettingsTab = 'general' | 'processing' | 'system' | 'security' | 'server';

export const SettingsModal: React.FC = () => {
    const {
        isSettingsOpen, toggleSettings,
        theme, setTheme,
        upscaleModel, scaleFactor, upscaleGpuId, gpus, setGpuId, setGpus, setUpscaleSettings,
        activeToolsTab,
        // Destructure new settings here
        serverEnabled, serverPort, setServerSettings,
        webSecurity, authToken, setSecuritySettings,
        geminiApiKey, setApiKey
    } = useAppStore();

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [cacheStats, setCacheStats] = useState<{ path: string, count: number, size: number } | null>(null);
    const [testStatus, setTestStatus] = useState<{ loading: boolean, success?: boolean, message?: string }>({ loading: false });

    useEffect(() => {
        if (isSettingsOpen) {
            refreshStats();
            refreshGpus();
            setTestStatus({ loading: false });
        }
    }, [isSettingsOpen]);

    const refreshStats = async () => {
        const stats = await window.electron.ipcRenderer.invoke('get-cache-stats');
        setCacheStats(stats);
    };

    const refreshGpus = async () => {
        if (gpus.length === 0) {
            const list = await window.electron.ipcRenderer.invoke('get-gpu-list');
            setGpus(list || []);
        }
    }

    const handleClearCache = async () => {
        const result = await window.electron.ipcRenderer.invoke('clear-cache');
        if (result.success) {
            refreshStats();
        }
    };

    const handleChangePath = async () => {
        const result = await window.electron.ipcRenderer.invoke('change-cache-path');
        if (result.success && result.path) {
            refreshStats();
        }
    };

    const handleTestKey = async (provider: 'gemini') => {
        setTestStatus({ loading: true, message: undefined });
        const key = provider === 'gemini' ? geminiApiKey : '';
        const result = await window.electron.ipcRenderer.invoke('test-api-key', { provider, key });
        setTestStatus({
            loading: false,
            success: result.success,
            message: result.success ? result.details : result.error
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isSettingsOpen) return null;

    const TabButton = ({ id, label, icon: Icon }: { id: SettingsTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium w-full text-left",
                activeTab === id
                    ? "bg-accent/10 text-accent"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSettings}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-[800px] h-[600px] max-w-full flex overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Sidebar */}
                <div className="w-56 bg-zinc-950/50 border-r border-zinc-800 p-4 flex flex-col gap-1">
                    <div className="px-4 py-3 mb-2">
                        <span className="font-semibold text-zinc-200 text-lg tracking-tight">Settings</span>
                    </div>

                    <TabButton id="general" label="Preferences" icon={SettingsIcon} />
                    <TabButton id="processing" label="Engine" icon={Cpu} />
                    <TabButton id="system" label="Cache" icon={HardDrive} />

                    <div className="my-2 h-px bg-zinc-800/50 mx-4" />

                    <TabButton id="security" label="API Keys" icon={Shield} />
                    <TabButton id="server" label="Web Server" icon={Globe} />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                    <div className="flex justify-end p-4">
                        <button onClick={toggleSettings} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Appearance</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-zinc-300 block mb-2">Theme</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(['dark', 'light', 'blue'] as Theme[]).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTheme(t)}
                                                        className={clsx(
                                                            "px-3 py-2 rounded border text-sm capitalize transition-all",
                                                            theme === t
                                                                ? "border-accent bg-accent/5 text-accent shadow-sm shadow-accent/10"
                                                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PROCESSING TAB */}
                        {activeTab === 'processing' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">AI Processing</h3>

                                    <div className="space-y-6">
                                        {/* GPU Selection */}
                                        <div>
                                            <label className="text-sm text-zinc-300 block mb-2">GPU Accelerator</label>
                                            <select
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                                onChange={(e) => setGpuId(e.target.value)}
                                                value={upscaleGpuId}
                                            >
                                                <option value="">Auto (Recommended)</option>
                                                {gpus.map(gpu => (
                                                    <option key={gpu.id} value={gpu.id}>
                                                        [{gpu.id}] {gpu.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-zinc-500 mt-2">
                                                Select 'Auto' to let the underlying engine choose the best available device.
                                            </p>
                                        </div>

                                        {/* Default Model */}
                                        <div>
                                            <label className="text-sm text-zinc-300 block mb-2">Default Model</label>
                                            <select
                                                value={upscaleModel}
                                                onChange={(e) => setUpscaleSettings(e.target.value, scaleFactor)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                            >
                                                <option value="RealESRGAN-x4">RealESRGAN-x4 (General Purpose)</option>
                                                <option value="Waifu2x">Waifu2x (Anime/Illustration)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SYSTEM TAB */}
                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Storage & Cache</h3>

                                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-md p-4 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-zinc-900 rounded text-zinc-500">
                                                <HardDrive size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-zinc-300 text-sm font-medium mb-1">Cache Location</div>
                                                <div className="text-zinc-500 text-xs font-mono break-all bg-zinc-900/50 p-2 rounded border border-zinc-800/50 mb-2">
                                                    {cacheStats?.path || 'Loading...'}
                                                </div>
                                                <button
                                                    onClick={handleChangePath}
                                                    className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-medium"
                                                >
                                                    <FolderOpen size={12} /> Change Folder
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-px bg-zinc-800/50" />

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-400 text-sm">Current Usage</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-zinc-200 font-mono text-lg font-bold">
                                                        {cacheStats ? formatSize(cacheStats.size) : '...'}
                                                    </span>
                                                    <span className="text-zinc-600 text-xs">
                                                        ({cacheStats?.count || 0} files)
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleClearCache}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-900/10 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-md transition-colors text-sm border border-red-900/20 hover:border-red-900/40"
                                            >
                                                <Trash2 size={14} />
                                                Clear Cache
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SERVER TAB (Includes Server Config + Old Security Settings) */}
                        {activeTab === 'server' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Local Web Server</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-zinc-300 font-medium">Enable Server</div>
                                                <div className="text-xs text-zinc-500">Allow local network access to files</div>
                                            </div>
                                            <button
                                                onClick={() => setServerSettings(!serverEnabled, serverPort)}
                                                className={clsx(
                                                    "w-12 h-6 rounded-full transition-colors relative",
                                                    serverEnabled ? "bg-accent" : "bg-zinc-700"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    serverEnabled ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-sm text-zinc-300 block mb-2">Port</label>
                                            <input
                                                type="number"
                                                value={serverPort}
                                                onChange={(e) => setServerSettings(serverEnabled, parseInt(e.target.value) || 3000)}
                                                className="bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-accent w-32"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Moved from Old Security Tab */}
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Server Security & Access</h3>
                                    <div className="space-y-6">
                                        <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded text-xs text-yellow-500 mb-4">
                                            Note: Changing security settings may require an application restart.
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-zinc-300 font-medium">Web Security (CORS)</div>
                                                <div className="text-xs text-zinc-500">Enforce standard browser security policies</div>
                                            </div>
                                            <button
                                                onClick={() => setSecuritySettings(!webSecurity, authToken)}
                                                className={clsx(
                                                    "w-12 h-6 rounded-full transition-colors relative",
                                                    webSecurity ? "bg-accent" : "bg-zinc-700"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    webSecurity ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-sm text-zinc-300 block mb-2">Auth Token</label>
                                            <input
                                                type="password"
                                                value={authToken}
                                                onChange={(e) => setSecuritySettings(webSecurity, e.target.value)}
                                                placeholder="Optional security token"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-accent font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY TAB (Now API Keys) */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">External API Keys</h3>
                                    <div className="space-y-6">

                                        {/* Gemini */}
                                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-md p-4">
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <label className="text-sm text-zinc-200 font-medium block mb-1">Google Gemini API</label>
                                                    <p className="text-xs text-zinc-500 mb-3">Required for AI chat and advanced analysis features.</p>

                                                    <div className="flex gap-2">
                                                        <input
                                                            type="password"
                                                            value={geminiApiKey}
                                                            onChange={(e) => setApiKey('gemini', e.target.value)}
                                                            placeholder="Enter your Gemini API Key..."
                                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-accent font-mono"
                                                        />
                                                        <button
                                                            onClick={() => handleTestKey('gemini')}
                                                            disabled={testStatus.loading || !geminiApiKey}
                                                            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white px-4 rounded text-sm font-medium transition-colors"
                                                        >
                                                            {testStatus.loading ? 'Testing...' : 'Test Key'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Test Result Area */}
                                                {testStatus.message && (
                                                    <div className={clsx(
                                                        "text-xs p-3 rounded border",
                                                        testStatus.success
                                                            ? "bg-green-900/10 border-green-900/30 text-green-400"
                                                            : "bg-red-900/10 border-red-900/30 text-red-400"
                                                    )}>
                                                        <p className="font-bold mb-1">{testStatus.success ? "Success" : "Verification Failed"}</p>
                                                        <p>{testStatus.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Placeholder for future keys */}
                                        <div className="opacity-50 pointer-events-none grayscale">
                                            <div className="bg-zinc-950/20 border border-zinc-800/50 rounded-md p-4">
                                                <label className="text-sm text-zinc-500 font-medium block mb-1">OpenAI API (Coming Soon)</label>
                                                <input disabled placeholder="Available in future updates..." className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-2.5 text-sm" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
