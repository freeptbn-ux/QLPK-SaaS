'use client';

import React, { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';

interface PatientSearchProps {
  onSearch: (term: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function PatientSearch({ 
  onSearch, 
  initialValue = '', 
  placeholder = 'Tìm theo tên hoặc số điện thoại...' 
}: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className={cn(
          "input-field pl-10 pr-10",
          "bg-surface dark:bg-surface-dark"
        )}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
