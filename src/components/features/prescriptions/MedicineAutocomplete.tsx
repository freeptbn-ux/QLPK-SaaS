'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { searchMedicines } from '@/actions/medicines';
import { Medicine } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';
import { useToast } from '@/hooks/useToast';
import { AlertColor } from '@/components/ui/Toast';

export interface MedicineAutocompleteProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelect: (medicine: Medicine | any) => void;
  excludeIds?: (number | string)[];
  debounceMs?: number;
  placeholder?: string;
  className?: string;
}

export const MedicineAutocomplete = React.memo(function MedicineAutocomplete({
  value,
  onChange,
  onSelect,
  excludeIds = [],
  debounceMs = 150,
  placeholder = 'Nhập tên thuốc để tìm...',
  className,
}: MedicineAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safe toast handler for environments without ToastProvider
  let showToast: (msg: string, type?: AlertColor) => void = () => {};
  try {
    const toast = useToast();
    if (toast?.showToast) {
      showToast = toast.showToast;
    }
  } catch {
    // Fallback when outside ToastProvider
  }

  // Request sequencing and debounce refs
  const latestRequestId = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCooldownRef = useRef(false);
  const pendingTrailingQueryRef = useRef<string | null>(null);

  // Synchronize external value if changed
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const executeSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setOptions([]);
        setLoading(false);
        return;
      }

      const currentRequestId = ++latestRequestId.current;
      setLoading(true);

      try {
        const res = await searchMedicines({
          query: trimmed,
          limit: 20,
        });

        // Discard stale in-flight responses
        if (currentRequestId === latestRequestId.current) {
          if (res && Array.isArray(res.data)) {
            const filtered = res.data.filter(
              (m: any) => !excludeIds.some((exId) => String(exId) === String(m.id))
            );
            setOptions(filtered);
          } else {
            setOptions([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (currentRequestId === latestRequestId.current) {
          setLoading(false);
        }
      }
    },
    [excludeIds]
  );

  const triggerSearch = useCallback(
    (query: string) => {
      if (!isCooldownRef.current) {
        // Leading edge: dispatch immediately for fast response
        isCooldownRef.current = true;
        pendingTrailingQueryRef.current = null;
        executeSearch(query);

        debounceTimerRef.current = setTimeout(() => {
          isCooldownRef.current = false;
          if (pendingTrailingQueryRef.current !== null) {
            const trailingQuery = pendingTrailingQueryRef.current;
            pendingTrailingQueryRef.current = null;
            triggerSearch(trailingQuery);
          }
        }, debounceMs);
      } else {
        // Trailing edge: queue latest query for execution after cooldown
        pendingTrailingQueryRef.current = query;
      }
    },
    [executeSearch, debounceMs]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    onChange?.(nextVal);
    setOpen(true);
    triggerSearch(nextVal);
  };

  useEffect(() => {
    setSelectedIndex(-1);
  }, [options]);

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
    onChange?.('');
    setOpen(false);
    setSelectedIndex(-1);
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown') setOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        if (targetIndex >= 0 && targetIndex < options.length) {
          handleSelect(options[targetIndex]);
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
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open && (options.length > 0 || loading)}
          aria-autocomplete="list"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setOpen(true);
            if (inputValue.trim()) {
              triggerSearch(inputValue);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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

      {open && (options.length > 0 || loading || inputValue.trim().length > 0) && (
        <div className="absolute z-50 w-full mt-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden max-h-64 overflow-y-auto">
          {loading && options.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Đang tìm kiếm...
            </div>
          ) : options.length > 0 ? (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {options.map((option, index) => {
                const isOutOfStock = option.stock_quantity === 0;
                const displaySpec = option.unit || option.packing_spec || '';
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
                        {displaySpec && (
                          <>
                            <span>{displaySpec}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                          </>
                        )}
                        <span className="text-primary-600 dark:text-primary-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.price)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <span className={cn(
                          isOutOfStock 
                            ? "text-red-600 dark:text-red-400 font-bold" 
                            : (option.min_stock_level !== undefined && option.stock_quantity <= option.min_stock_level) 
                              ? "text-amber-500 dark:text-amber-400" 
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
