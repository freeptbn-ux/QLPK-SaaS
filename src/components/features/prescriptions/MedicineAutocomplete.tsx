'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { Medicine } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';
import { useToast } from '@/hooks/useToast';
import { AlertColor } from '@/components/ui/Toast';
import { useMedicineCatalog } from '@/hooks/useMedicineCatalog';
import { removeDiacritics } from '@/lib/utils/normalize';

export interface MedicineAutocompleteProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelect: (medicine: Medicine | any) => void;
  excludeIds?: (number | string)[];
  debounceMs?: number;
  placeholder?: string;
  className?: string;
  clinicId?: string | number;
}

export const MedicineAutocomplete = React.memo(function MedicineAutocomplete({
  value,
  onChange,
  onSelect,
  excludeIds = [],
  debounceMs = 150,
  placeholder = 'Nhập tên thuốc để tìm...',
  className,
  clinicId,
}: MedicineAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { medicines = [], isLoading } = useMedicineCatalog({ clinicId });

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

  // Pre-index medicines with normalized names to avoid repeated diacritic stripping on keystrokes
  const indexedMedicines = useMemo(() => {
    return medicines.map((m) => ({
      medicine: m,
      normalizedName: removeDiacritics(m.name || ''),
    }));
  }, [medicines]);

  // Synchronous, zero-latency tokenized candidate filtering
  const options = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return [];
    }

    const excludeSet = new Set((excludeIds || []).map((id) => String(id)));
    const queryTokens = removeDiacritics(trimmed).split(/\s+/).filter(Boolean);

    if (queryTokens.length === 0) {
      return [];
    }

    const matches: Medicine[] = [];
    for (const item of indexedMedicines) {
      if (excludeSet.has(String(item.medicine.id))) {
        continue;
      }
      const matchesAllTokens = queryTokens.every((token) =>
        item.normalizedName.includes(token)
      );
      if (matchesAllTokens) {
        matches.push(item.medicine);
        if (matches.length >= 20) {
          break;
        }
      }
    }
    return matches;
  }, [indexedMedicines, inputValue, excludeIds]);

  // Synchronize external value if changed
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    onChange?.(nextVal);
    setOpen(true);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (medicine: Medicine) => {
      if (medicine.stock_quantity === 0) {
        showToast('Thuốc này hiện đã hết hàng trong kho.', 'error');
        return;
      }
      onSelect(medicine);
      setInputValue('');
      onChange?.('');
      setOpen(false);
      setSelectedIndex(-1);
    },
    [onSelect, onChange, showToast]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (options.length > 0) {
          setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (options.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        if (targetIndex >= 0 && targetIndex < options.length) {
          handleSelect(options[targetIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const isInitialCatalogLoading = isLoading && medicines.length === 0;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open && (options.length > 0 || isInitialCatalogLoading)}
          aria-autocomplete="list"
          aria-controls="medicine-autocomplete-listbox"
          aria-activedescendant={
            open && selectedIndex >= 0 && options[selectedIndex]
              ? `medicine-option-${options[selectedIndex].id}`
              : undefined
          }
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "input-field pl-11 pr-10 bg-white dark:bg-slate-900 h-11",
            open && (options.length > 0 || isInitialCatalogLoading) && "rounded-b-none border-b-transparent ring-2 ring-primary-500/20 border-primary-500"
          )}
        />
        {isInitialCatalogLoading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <BallLoader size="sm" text="" className="!gap-0" />
          </div>
        )}
      </div>

      {open && (options.length > 0 || isInitialCatalogLoading || inputValue.trim().length > 0) && (
        <div className="absolute z-50 w-full mt-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden max-h-64 overflow-y-auto">
          {isInitialCatalogLoading ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Đang tải danh mục thuốc...
            </div>
          ) : options.length > 0 ? (
            <ul
              id="medicine-autocomplete-listbox"
              role="listbox"
              className="divide-y divide-gray-50 dark:divide-gray-800/50"
            >
              {options.map((option, index) => {
                const isOutOfStock = option.stock_quantity === 0;
                const displaySpec = option.unit || option.packing_spec || '';
                const isSelected = selectedIndex === index;
                return (
                  <li
                    key={option.id}
                    id={`medicine-option-${option.id}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors flex flex-col gap-0.5 outline-none",
                        isSelected 
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
                            : isSelected 
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
