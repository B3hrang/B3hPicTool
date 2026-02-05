import { useAppStore } from '../store';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const TabBar = () => {
    const { tabs, activeTabId, setActiveTab, closeTab } = useAppStore();

    if (tabs.length === 0) return null;

    return (
        <div className="h-9 flex items-center bg-secondary/20 border-b border-zinc-800 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                        "group flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px] border-r border-zinc-800/50 cursor-pointer select-none text-xs transition-colors",
                        activeTabId === tab.id ? "bg-background text-accent border-t-2 border-t-accent" : "text-zinc-500 hover:bg-secondary/40 hover:text-zinc-300"
                    )}
                >
                    <span className="truncate flex-1">{tab.title}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                        }}
                        className={clsx("opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-zinc-700", activeTabId === tab.id && "bg-zinc-800/10")}
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
};
