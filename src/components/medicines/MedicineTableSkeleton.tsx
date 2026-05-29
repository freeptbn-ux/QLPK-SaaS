import React from 'react';

export default function MedicineTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Alert Skeleton */}
      <div className="h-20 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-full border border-slate-100 dark:border-slate-800" />

      {/* Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-full md:w-96 border border-slate-100 dark:border-slate-800" />
        <div className="flex gap-2">
          <div className="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-28 border border-slate-100 dark:border-slate-800" />
          <div className="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-36 border border-slate-100 dark:border-slate-800" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 w-1/3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></th>
                <th className="px-6 py-5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></th>
                <th className="px-6 py-5 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto" /></th>
                <th className="px-6 py-5 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" /></th>
                <th className="px-6 py-5 text-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto" /></th>
                <th className="px-6 py-5 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="px-6 py-5"><div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" /></td>
                  <td className="px-6 py-5"><div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" /></td>
                  <td className="px-6 py-5 text-right"><div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-24 ml-auto" /></td>
                  <td className="px-6 py-5 text-right"><div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-12 ml-auto" /></td>
                  <td className="px-6 py-5 text-center"><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20 mx-auto" /></td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                      <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/10">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-40" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
