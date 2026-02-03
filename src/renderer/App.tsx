import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useAppStore } from './store';
import { DropZone } from './components/DropZone';
import { ImageEditor } from './components/ImageEditor';

const App = () => {
  const { activeTabId, files, tabs } = useAppStore();

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <Layout>
      <div className="h-full w-full">
         {activeTab ? (
           <>
              {activeTab.type === 'upscale' ? (
                 <ImageEditor />
              ) : (
                 <div className="flex items-center justify-center h-full text-zinc-500">
                    {/* Preview Mode - Simplified view for now */}
                    <img 
                       src={files.find(f => f.id === activeTab.fileId)?.preview} 
                       className="max-w-full max-h-full object-contain"
                       draggable={false}
                    />
                 </div>
              )}
           </>
         ) : (
           <div className="h-full p-8 flex flex-col">
              <DropZone />
              
              {/* Fallback info */}
              {files.length > 0 && !activeTabId && (
                 <div className="mt-8 text-center text-zinc-600">
                    <p>Double click a file in the sidebar to open.</p>
                 </div>
              )}
           </div>
         )}
      </div>
    </Layout>
  );
};

export default App;
