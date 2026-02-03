import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'blue';
type Activity = 'upscale' | 'settings' | 'files';


export interface ImageFile {
  id: string;
  name: string;
  path: string;
  preview: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  originalSize?: number;
  processedPreview?: string;
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
  
  updateFileStatus: (id: string, status: ImageFile['status'], processedPreview?: string) => void;
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

  setTheme: (theme) => set({ theme }),
  
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

  addFiles: (newFiles) => set((state) => ({ 
      files: [...state.files, ...newFiles] 
  })),

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

    const existingTab = state.tabs.find(t => t.fileId === fileId && t.type === type);
    if (existingTab) {
        return { activeTabId: existingTab.id };
    }

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

  updateFileStatus: (id, status, processedPreview) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, status, processedPreview } : f)
  })),
}));
