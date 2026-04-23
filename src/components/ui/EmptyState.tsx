import React from 'react';
import { HiInbox } from 'react-icons/hi2';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-slate-900/50 transition-all">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-primary-500/10 blur-2xl rounded-full" />
        <div className="relative p-6 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600">
          <HiInbox className="text-6xl" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {action}
        </div>
      )}
    </div>
  );
}
