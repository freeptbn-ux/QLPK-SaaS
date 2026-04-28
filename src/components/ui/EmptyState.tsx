import React from 'react';
import { HiInbox } from 'react-icons/hi2';
import { IconType } from 'react-icons';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: IconType;
  className?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  action, 
  icon: Icon = HiInbox,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm transition-all",
      className
    )}>
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-400 dark:text-slate-500 border border-slate-50 dark:border-slate-700/50">
          <Icon className="text-5xl" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-base leading-relaxed font-medium">
          {description}
        </p>
      )}
      
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          {action}
        </div>
      )}
    </div>
  );
}
