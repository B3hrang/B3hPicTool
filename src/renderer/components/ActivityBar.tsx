import React from 'react';
import { useAppStore } from '../store';
import { Settings, Image, FileStack } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const ActivityBar = () => {
  const { activeActivity, setActivity, sidebarVisible, toggleSidebar } = useAppStore();
  const { t } = useTranslation();

  const ActionIcon = ({ activity, icon: Icon, label }: { activity: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        if (activeActivity === activity) {
          toggleSidebar();
        } else {
          setActivity(activity as any);
        }
      }}
      className={clsx(
        "p-3 mb-2 rounded-md transition-colors relative group",
        activeActivity === activity && sidebarVisible
          ? "text-accent"
          : "text-zinc-400 hover:text-zinc-100" // Should indicate active but hidden? VSCode keeps it white.
      )}
      title={label}
    >
      <Icon size={28} strokeWidth={1.5} />
      {activeActivity === activity && sidebarVisible && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-md" />
      )}
    </button>
  );

  return (
    <div className="w-16 bg-secondary flex flex-col items-center py-4 border-r border-zinc-800 rtl:border-l rtl:border-r-0 z-20">
      <ActionIcon activity="upscale" icon={Image} label={t('nav.upscale', 'Upscale')} />
      <ActionIcon activity="files" icon={FileStack} label={t('nav.files', 'Files')} />
      <div className="flex-1" />
      <ActionIcon activity="settings" icon={Settings} label={t('nav.settings', 'Settings')} />
    </div>
  );
};
