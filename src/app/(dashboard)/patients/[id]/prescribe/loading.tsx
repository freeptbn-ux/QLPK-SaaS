import React from 'react';
import { HiChevronRight } from 'react-icons/hi2';

export default function PrescribeLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm font-medium">
            <li><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div></li>
            <HiChevronRight className="w-4 h-4 text-slate-200 dark:text-slate-800" />
            <li><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div></li>
            <HiChevronRight className="w-4 h-4 text-slate-200 dark:text-slate-800" />
            <li><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div></li>
          </ol>
        </nav>
        
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-4 mt-2"></div>
        <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800 rounded mt-2 max-w-full"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  </div>
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Actions Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                
                <div className="mt-4 space-y-2 pt-2">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
              
              <div className="flex justify-between items-end mb-8">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-1"></div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
