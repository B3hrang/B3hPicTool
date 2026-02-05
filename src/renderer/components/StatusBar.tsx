import { useAppStore } from '../store';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const StatusBar = () => {
  const { t } = useTranslation();
  const { toggleTerminal, isTerminalOpen } = useAppStore();

  return (
    <div className="h-6 bg-accent text-accent-foreground flex items-center px-3 text-xs justify-between select-none z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1.5 px-2 py-0.5 hover:bg-black/10 rounded transition-colors ${isTerminalOpen ? 'bg-black/10 font-bold' : ''}`}
        >
          <Terminal size={12} />
          <span>Output</span>
        </button>
        <span>{t('status.ready', 'Ready')}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8</span>
        <span>TypeScript React</span>
      </div>
    </div>
  );
};
