import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wand2, ImageMinus } from 'lucide-react';
import { useAppStore } from '../store';
import clsx from 'clsx';

export const RightActivityBar = () => {
    const { activeRightActivity, rightSidebarOpen, setRightActivity } = useAppStore();
    const { t } = useTranslation();

    return (
        <div className="w-12 bg-secondary/80 border-l border-zinc-900 flex flex-col items-center py-4 gap-4 z-20">
            {/* Upscale Toggle */}
            <div className="relative group w-full flex justify-center">
                <button 
                    onClick={() => setRightActivity('upscale')}
                    className={clsx(
                        "p-2 rounded-md transition-all",
                        activeRightActivity === 'upscale' && rightSidebarOpen 
                            ? "bg-accent/20 text-accent" 
                            : "text-zinc-500 hover:text-zinc-200"
                    )}
                    title="Upscale"
                >
                    <Wand2 size={24} strokeWidth={1.5} />
                </button>
                {activeRightActivity === 'upscale' && rightSidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full" />
                )}
            </div>

            {/* Remove BG Toggle */}
            <div className="relative group w-full flex justify-center">
                 <button 
                    onClick={() => setRightActivity('removebg')}
                    className={clsx(
                        "p-2 rounded-md transition-all",
                        activeRightActivity === 'removebg' && rightSidebarOpen 
                            ? "bg-accent/20 text-accent" 
                            : "text-zinc-500 hover:text-zinc-200"
                    )}
                    title="Remove BG (Coming Soon)"
                >
                    <ImageMinus size={24} strokeWidth={1.5} />
                </button>
                 {activeRightActivity === 'removebg' && rightSidebarOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full" />
                )}
            </div>

        </div>
    );
};
