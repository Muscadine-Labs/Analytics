'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <div className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white/70 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:px-6 sm:py-3">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] touch-manipulation lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">Muscadine Analytics</div>
      </div>
      <ThemeSwitcher />
    </div>
  );
}
