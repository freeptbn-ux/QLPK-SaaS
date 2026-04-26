'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getMedicines } from '@/actions/medicines';
import { Medicine } from '@/types/database';
import debounce from 'lodash/debounce';
import { cn } from '@/lib/utils/cn';

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine | null) => void;
  excludeIds?: number[];
}

const MedicineAutocomplete = React.memo(function MedicineAutocomplete({ onSelect, excludeIds = [] }: MedicineAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedFetch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        setLoading(true);
        try {
          const results = await getMedicines(query);
          // Filter out already selected medicines
          const filtered = results.filter((m: Medicine) => !excludeIds.includes(m.id));
          setOptions(filtered);
          setSelectedIndex(filtered.length > 0 ? 0 : -1);
        } catch (error) {
          console.error('Error fetching medicines:', error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [excludeIds]
  );

  const fetchMedicines = useCallback(
    (query: string) => {
      debouncedFetch(query);
    },
    [debouncedFetch]
  );

  useEffect(() => {
    if (open) {
      fetchMedicines(inputValue);
    }
  }, [inputValue, open, fetchMedicines]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine);
    setInputValue('');
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown') setOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          handleSelect(options[selectedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tên thuốc để tìm..."
          className={cn(
            "input-field pl-11 pr-10 bg-white dark:bg-slate-900 h-11",
            open && (options.length > 0 || loading) && "rounded-b-none border-b-transparent ring-2 ring-primary-500/20 border-primary-500"
          )}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <svg className="animate-spin h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {open && (options.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden max-h-64 overflow-y-auto">
          {loading && options.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Đang tìm kiếm...
            </div>
          ) : options.length > 0 ? (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {options.map((option, index) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors flex flex-col gap-0.5 outline-none",
                      selectedIndex === index ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      selectedIndex === index ? "text-primary-700 dark:text-primary-300" : "text-gray-900 dark:text-gray-100"
                    )}>
                      {option.name}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <span>{option.packing_spec}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className="text-primary-600 dark:text-primary-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.price)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className={cn(
                        option.stock_quantity <= option.min_stock_level ? "text-red-500" : "text-gray-500"
                      )}>
                        Tồn: {option.stock_quantity}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default MedicineAutocomplete;
