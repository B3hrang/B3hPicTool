import React from 'react';
import { useTranslation } from 'react-i18next';

export const StatusBar = () => {
  const { t } = useTranslation();

  return (
    <div className="h-6 bg-accent text-accent-foreground flex items-center px-3 text-xs justify-between select-none z-30">
      <div className="flex items-center gap-4">
         <span>{t('status.ready', 'Ready')}</span>
      </div>
      <div className="flex items-center gap-4">
         <span>UTF-8</span>
         <span>TypeScript React</span>
      </div>
    </div>
  );
};
