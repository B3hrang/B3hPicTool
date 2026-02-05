import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'blue';


export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

export interface ImageFile {
  id: string;
  name: string;
  path: string;
  preview: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  originalSize?: number;
  processedPreview?: string;
  progress?: number;
}



export interface EditorTab {
  id: string;
  fileId: string;
  type: 'preview' | 'upscale';
  title: string;
}

type LeftActivity = 'files'; // Settings is a button but maybe treats as activity? Or IPC? User said "yellow box hosts files and settings". Let's say files is a panel. Settings might be a modal or panel. User said "click files -> list opens".
// User said "settings button ... opens settings window". So Settings is likely just a button in the bar, not a panel state, unless we embed settings.
// Previous implementation: Settings opens NEW WINDOW. User seems to want button in Left Activity Bar.
// So LeftActivity = 'files' | null (if closed?) or always 'files' but sidebar closed?
// User: "Sidebar extends... collapse if click again".

type RightActivity = 'upscale' | 'removebg';

interface AppState {
  theme: Theme;
  
  // Layout State
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  
  activeLeftActivity: LeftActivity;
  activeRightActivity: RightActivity;

  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  
  setLeftActivity: (activity: LeftActivity) => void;
  setRightActivity: (activity: RightActivity) => void;
  
  // Data State
  files: ImageFile[];
  tabs: EditorTab[];
  activeTabId: string | null;
  
  // Actions
  setTheme: (theme: Theme) => void;
  addFiles: (files: ImageFile[]) => void;
  removeFile: (id: string) => void;
  
  // Tab Management
  openTab: (fileId: string, type: 'preview' | 'upscale') => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  
  // Upscale State
  upscaleModel: string;
  scaleFactor: number;
  upscaleVariant: string;
  upscaleGpuId: string;
  gpus: { id: string, name: string }[];
  setUpscaleSettings: (model: string, factor: number) => void;
  setUpscaleVariant: (variant: string) => void;
  setGpuId: (id: string) => void;
  setGpus: (gpus: { id: string, name: string }[]) => void;

  // Terminal & Logs
  isTerminalOpen: boolean;
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry['type']) => void;
  toggleTerminal: () => void;
  setTerminalOpen: (isOpen: boolean) => void;
  
  isSettingsOpen: boolean;
  toggleSettings: () => void;

  updateFileStatus: (id: string, status: ImageFile['status'], processedPreview?: string, progress?: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  
  activeLeftActivity: 'files',
  activeRightActivity: 'upscale',

  files: [],
  tabs: [],
  activeTabId: null,
  
  gpus: [],

  // Upscale Defaults
  upscaleModel: 'RealESRGAN-x4',
  scaleFactor: 4,
  upscaleVariant: 'realesrgan-x4plus', // Default
  upscaleGpuId: '', // Default auto
  
  logs: [],
  isTerminalOpen: false,
  isSettingsOpen: false,

  setTheme: (theme) => set({ theme }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  
  setUpscaleSettings: (upscaleModel, scaleFactor) => set({ upscaleModel, scaleFactor }),
  setUpscaleVariant: (variant) => set({ upscaleVariant: variant }),
  setGpuId: (id: string) => {
      set({ upscaleGpuId: id });
      // Persist setting
      window.electron.ipcRenderer.invoke('set-setting', 'upscaleGpuId', id);
  },
  setGpus: (gpus) => set({ gpus }),

  addLog: (message, type = 'info') => set((state) => {
      const now = new Date();
      // Format: [HH:MM:SS MM-DD-YYYY] > Message
      // Manually formatting to ensure MM-DD-YYYY
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      
      const formattedMessage = `[${timeStr} ${dateStr}] > ${message}`;
      
      return {
        logs: [...state.logs, {
            id: crypto.randomUUID(),
            message: formattedMessage,
            type,
            timestamp: `${timeStr} ${dateStr}`
        }],
        isTerminalOpen: type === 'error' ? true : state.isTerminalOpen
      };
  }),

  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  setTerminalOpen: (isOpen) => set({ isTerminalOpen: isOpen }),

  // Logic: If clicking same activity, toggle sidebar. If different, switch and ensure open.
  setLeftActivity: (activity) => set((state) => ({ 
      activeLeftActivity: activity,
      leftSidebarOpen: state.activeLeftActivity === activity ? !state.leftSidebarOpen : true
  })),

  setRightActivity: (activity) => set((state) => ({ 
      activeRightActivity: activity,
      rightSidebarOpen: state.activeRightActivity === activity ? !state.rightSidebarOpen : true
  })),

  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

  addFiles: (newFiles) => {
      const state = get();
      const currentFiles = state.files;
      const validFiles: ImageFile[] = [];

      newFiles.forEach(file => {
          // Check for duplicates (Normalize path to handle inconsistencies)
          const normalizedPath = file.path.toLowerCase().replace(/\\/g, '/');
          const exists = currentFiles.some(f => 
             f.path.toLowerCase().replace(/\\/g, '/') === normalizedPath
          );
          
          if (exists) {
              // Duplicate found
          } else {
              validFiles.push(file);
              state.addLog(`File ${file.name} has been added.`, 'info');
          }
      });

      if (validFiles.length > 0) {
          set((state) => ({ 
            files: [...state.files, ...validFiles] 
          }));
      }
  },

  removeFile: (id) => set((state) => {
      const remainingTabs = state.tabs.filter(t => t.fileId !== id);
      const isActiveTabClosed = !remainingTabs.find(t => t.id === state.activeTabId);
      
      return { 
        files: state.files.filter(f => f.id !== id),
        tabs: remainingTabs,
        activeTabId: isActiveTabClosed ? (remainingTabs[remainingTabs.length - 1]?.id || null) : state.activeTabId
      };
  }),



  // Tab Logic
  openTab: (fileId, type) => set((state) => {
    const file = state.files.find(f => f.id === fileId);
    if (!file) return {};

    // Check if tab exists
    const existingTab = state.tabs.find(t => t.fileId === fileId && t.type === type);
    
    if (existingTab) {
        // Jump to existing
        return { activeTabId: existingTab.id };
    }

    // Create New Tab (Don't close others)
    const newTab: EditorTab = {
        id: crypto.randomUUID(),
        fileId,
        type,
        title: type === 'upscale' ? `UpScale - ${file.name}` : `Preview - ${file.name}`
    };

    return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id
    };
  }),

  closeTab: (tabId) => set((state) => {
      const remainingTabs = state.tabs.filter(t => t.id !== tabId);
      let newActiveId = state.activeTabId;
      
      if (state.activeTabId === tabId) {
          newActiveId = remainingTabs[remainingTabs.length - 1]?.id || null;
      }

      return { tabs: remainingTabs, activeTabId: newActiveId };
  }),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateFileStatus: (id, status, processedPreview, progress) => set((state) => ({
    files: state.files.map(f => {
        if (f.id !== id) return f;
        return { 
            ...f, 
            status, 
            processedPreview: processedPreview ?? f.processedPreview,
            // If progress is provided, update it. If not, keep existing unless status changed to 'idle'
            progress: progress !== undefined ? progress : (status === 'idle' ? 0 : f.progress) 
        };
    })
  })),
}));
