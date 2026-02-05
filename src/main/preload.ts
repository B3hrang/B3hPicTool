import { contextBridge, ipcRenderer } from 'electron';

// Track listeners for correct removal
const listenerMap = new Map<string, Map<Function, any>>();

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: string, ...args: any[]) {
      const validChannels = ['open-settings', 'minimize-window', 'maximize-window', 'close-window', 'upscale-image'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
    on(channel: string, func: (...args: any[]) => void) {
      const validChannels = ['settings-opened', 'upscale-progress', 'upscale-done', 'upscale-error', 'upscale-log']; // Added upscale-log
      if (validChannels.includes(channel)) {
        // Create wrapper
        const wrapper = (_event: any, ...args: any[]) => func(...args);
        
        // Store wrapper
        if (!listenerMap.has(channel)) {
            listenerMap.set(channel, new Map());
        }
        listenerMap.get(channel)!.set(func, wrapper);

        ipcRenderer.on(channel, wrapper);
      }
    },
    once(channel: string, func: (...args: any[]) => void) {
      const validChannels = ['settings-opened', 'upscale-done'];
      if (validChannels.includes(channel)) {
        // Wrappers for once don't typically need removal, but for completeness...
        // Electron's 'once' auto-removes, so manual tracking is less critical unless we want to cancel early.
        // Simplified: just wrap
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
    removeListener(channel: string, func: (...args: any[]) => void) {
      const validChannels = ['settings-opened', 'upscale-progress', 'upscale-done', 'upscale-error', 'upscale-log'];
      if (validChannels.includes(channel)) {
        const channelMap = listenerMap.get(channel);
        if (channelMap && channelMap.has(func)) {
            const wrapper = channelMap.get(func);
            ipcRenderer.removeListener(channel, wrapper);
            channelMap.delete(func);
        }
      }
    },
    removeAllListeners(channel: string) {
      const validChannels = ['settings-opened', 'upscale-progress', 'upscale-done', 'upscale-error', 'upscale-log'];
      if (validChannels.includes(channel)) {
          ipcRenderer.removeAllListeners(channel);
          listenerMap.delete(channel);
      }
    },
    invoke(channel: string, ...args: any[]) {
        const validChannels = ['save-file', 'save-file-direct', 'show-item-in-folder', 'get-cache-stats', 'clear-cache', 'change-cache-path', 'get-settings', 'set-setting', 'get-gpu-list'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        return Promise.reject(new Error(`Invalid channel: ${channel}`));
    }
  },
  // Expose platform for UI conditional rendering (e.g. Mac vs Win titlebar)
  platform: process.platform,
});
