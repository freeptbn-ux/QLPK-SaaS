'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  limit: number;
}

export default function Pagination({ currentPage, totalCount, limit }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / limit);

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <nav className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-4 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
          className={cn(
            "relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            currentPage > 1 
              ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700" 
              : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800 pointer-events-none"
          )}
        >
          Trước
        </Link>
        <Link
          href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
          className={cn(
            "relative ml-3 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            currentPage < totalPages 
              ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700" 
              : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800 pointer-events-none"
          )}
        >
          Sau
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị <span className="font-bold text-slate-900 dark:text-slate-100">{(currentPage - 1) * limit + 1}</span> đến{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min(currentPage * limit, totalCount)}</span> trong tổng số{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{totalCount}</span> kết quả
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <Link
              href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
              className={cn(
                "relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-all",
                currentPage === 1 && "pointer-events-none opacity-50"
              )}
            >
              <span className="sr-only">Previous</span>
              <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            
            {getVisiblePages().map((page, idx) => (
              page === '...' ? (
                <span
                  key={`dots-${idx}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:outline-offset-0"
                >
                  ...
                </span>
              ) : (
                <Link
                  key={page}
                  href={createPageURL(page)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-all ring-1 ring-inset",
                    currentPage === page
                      ? "z-10 bg-primary-600 text-white ring-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      : "text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {page}
                </Link>
              )
            ))}

            <Link
              href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
              className={cn(
                "relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-all",
                currentPage === totalPages && "pointer-events-none opacity-50"
              )}
            >
              <span className="sr-only">Next</span>
              <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}
