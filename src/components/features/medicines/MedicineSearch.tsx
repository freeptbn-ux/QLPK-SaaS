'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useDebounce } from '@/hooks/useDebounce';

export default function MedicineSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [text, setText] = useState(searchParams.get('search') || '');
  const debouncedText = useDebounce(text, 300);

  // Sync state with URL if it changes from outside (e.g. back button)
  useEffect(() => {
    setText(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    
    // Only update URL if debounced text differs from current URL search
    if (debouncedText === currentSearch) return;

    const params = new URLSearchParams(searchParams);
    if (debouncedText) {
      params.set('search', debouncedText);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when search term changes
    params.delete('page');
    
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedText, pathname, router, searchParams]);

  return (
    <div className="flex-grow max-w-lg relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <HiOutlineMagnifyingGlass className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm thuốc..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input-field pl-10 bg-white dark:bg-slate-900 shadow-sm"
      />
    </div>
  );
}
