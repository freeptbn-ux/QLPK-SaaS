'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getMedicines } from '@/actions/medicines';
import { Medicine } from '@/types/database';
import debounce from 'lodash/debounce';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';
import { useToast } from '@/hooks/useToast';

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
  const { showToast } = useToast();

  // Memoize excludeIds to avoid unnecessary reference changes
  const memoizedExcludeIds = React.useMemo(() => excludeIds, [JSON.stringify(excludeIds)]);
  const excludeIdsRef = useRef(excludeIds);

  useEffect(() => {
    excludeIdsRef.current = memoizedExcludeIds;
  }, [memoizedExcludeIds]);

  const debouncedFetch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        setLoading(true);
        try {
          const results = await getMedicines(query);
          // Use the latest excludeIds from ref to keep this function stable
          const filtered = results.filter((m: Medicine) => !excludeIdsRef.current.includes(m.id));
          setOptions(filtered);
          setSelectedIndex(filtered.length > 0 ? 0 : -1);
        } catch (error) {
          console.error('Error fetching medicines:', error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [] // Stable: never recreated
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

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
    if (medicine.stock_quantity === 0) {
      showToast('Thuốc này hiện đã hết hàng trong kho.', 'error');
      return;
    }
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
            <BallLoader size="sm" text="" className="!gap-0" />
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
              {options.map((option, index) => {
                const isOutOfStock = option.stock_quantity === 0;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors flex flex-col gap-0.5 outline-none",
                        selectedIndex === index 
                          ? (isOutOfStock ? "bg-red-50/50 dark:bg-red-900/10" : "bg-primary-50 dark:bg-primary-900/20") 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        isOutOfStock && "cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-bold",
                          isOutOfStock 
                            ? "text-red-600 dark:text-red-400" 
                            : selectedIndex === index 
                              ? "text-primary-700 dark:text-primary-300" 
                              : "text-gray-900 dark:text-gray-100"
                        )}>
                          {option.name}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium border border-red-100 dark:border-red-800/50">
                            Hết hàng
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span>{option.packing_spec}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className="text-primary-600 dark:text-primary-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.price)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className={cn(
                          isOutOfStock 
                            ? "text-red-600 dark:text-red-400 font-bold" 
                            : option.stock_quantity <= option.min_stock_level 
                              ? "text-red-500 dark:text-orange-400" 
                              : "text-gray-500 dark:text-gray-400"
                        )}>
                          Tồn: {option.stock_quantity}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
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
