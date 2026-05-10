'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function MedicineSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [text, setText] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (text) {
        params.set('search', text);
      } else {
        params.delete('search');
      }
      // Reset to page 1 when searching
      params.delete('page');
      
      if (pathname === '/medicines') {
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [text, pathname, router, searchParams]);

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
