import React from 'react';
import { cn } from '@/lib/utils/cn';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function LoadingSkeleton({ rows = 5, columns = 5 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </>
  );
}

interface TableSkeletonProps extends LoadingSkeletonProps {
  headers?: { label: string; className?: string }[];
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 5, headers, className }: TableSkeletonProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {headers && (
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className={cn("px-6 py-4", h.className)}>{h.label}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <LoadingSkeleton rows={rows} columns={columns} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

