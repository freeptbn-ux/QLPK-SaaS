import React from 'react';

export default function PrescriptionSkeleton() {
  return (
    <div className="mt-8 space-y-4 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 flex-1 sm:w-40 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          <div className="h-10 flex-1 sm:w-40 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
