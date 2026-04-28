import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
