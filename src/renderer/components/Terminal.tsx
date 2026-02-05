import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { X, ChevronDown, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const Terminal: React.FC = () => {
    const { logs, isTerminalOpen, setTerminalOpen, addLog } = useAppStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(200);
    const [isResizing, setIsResizing] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isTerminalOpen]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing) {
                const newHeight = window.innerHeight - e.clientY - 24; // 24px for status bar height
                setHeight(Math.max(100, Math.min(newHeight, 600)));
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (!isTerminalOpen) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: isResizing ? 0 : 0.2 }} // Disable animation during resize
            className="border-t border-zinc-800 bg-zinc-950 flex flex-col z-20 relative"
            style={{ height }}
        >
            {/* Drag Handle */}
            <div
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-accent/50 z-50 transition-colors"
                onMouseDown={() => setIsResizing(true)}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-1 bg-zinc-900 border-b border-zinc-800 select-none">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <TerminalIcon size={12} />
                    <span>Output</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => useAppStore.setState({ logs: [] })} className="p-1 hover:text-red-400 text-zinc-500 transition-colors" title="Clear Logs">
                        <Trash2 size={12} />
                    </button>
                    <button onClick={() => setTerminalOpen(false)} className="p-1 hover:text-white text-zinc-500 transition-colors">
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Logs Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent bg-zinc-950"
            >
                {logs.length === 0 && (
                    <div className="text-zinc-600 italic">No logs yet...</div>
                )}
                <div className="whitespace-pre-wrap select-text leading-tight">
                    {logs.map((log) => (
                        <span
                            key={log.id}
                            className={clsx(
                                'block',
                                log.type === 'info' && 'text-zinc-300',
                                log.type === 'success' && 'text-green-400',
                                log.type === 'error' && 'text-red-400',
                                log.type === 'warning' && 'text-yellow-400'
                            )}
                        >
                            {log.message}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
