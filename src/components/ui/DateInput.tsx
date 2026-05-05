'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

interface DateInputProps {
  value: string; // "DD/MM/YYYY" hoặc ""
  onChange: (value: string) => void;
  label?: string; // Default: "Ngày sinh"
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: {
    day?: string; // Default: "DD"
    month?: string; // Default: "MM"
    year?: string; // Default: "YYYY"
  };
}

export const DateInput: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  label = 'Ngày sinh',
  required = false,
  error = false,
  helperText,
  disabled = false,
  placeholder = {},
}) => {
  // Use a ref to track the last value we emitted to avoid loops
  const lastEmittedValue = useRef(value);

  // Local state for segments to handle rapid input and testing environments
  const getParts = (v: string) => (v && v.includes('/') ? v.split('/') : ['', '', '']);
  const [segments, setSegments] = useState(() => getParts(value));

  // Sync with prop value
  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      setSegments(getParts(value));
      lastEmittedValue.current = value;
    }
  }, [value]);

  const day = segments[0] || '';
  const month = segments[1] || '';
  const year = segments[2] || '';

  const [focused, setFocused] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const updateParent = (d: string, m: string, y: string) => {
    setSegments([d, m, y]);
    const newValue = (d || m || y) ? `${d}/${m}/${y}` : '';
    if (newValue !== lastEmittedValue.current) {
      lastEmittedValue.current = newValue;
      onChange(newValue);
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    updateParent(val, month, year);
    if (val.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    updateParent(day, val, year);
    if (val.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    updateParent(day, month, val);
  };

  const handleKeyDown = (field: 'day' | 'month' | 'year', e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '') {
      if (field === 'month') {
        dayRef.current?.focus();
      } else if (field === 'year') {
        monthRef.current?.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '');

    if (digits.length >= 8) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      const y = digits.slice(4, 8);
      updateParent(d, m, y);
      yearRef.current?.focus();
      e.preventDefault();
    } else if (pastedData.includes('/')) {
      const p = pastedData.split('/');
      if (p.length === 3) {
        const d = p[0].replace(/\D/g, '').slice(0, 2);
        const m = p[1].replace(/\D/g, '').slice(0, 2);
        const y = p[2].replace(/\D/g, '').slice(0, 4);
        updateParent(d, m, y);
        yearRef.current?.focus();
        e.preventDefault();
      }
    }
  };

  // Sync ref with prop value if it changes externally
  useEffect(() => {
    lastEmittedValue.current = value;
  }, [value]);

  return (
    <div className="w-full">
      {label && (
        <label 
          className={cn(
            "block text-sm font-semibold mb-2 transition-colors",
            error ? "text-red-500" : focused ? "text-primary-600" : "text-slate-500 dark:text-slate-400",
            disabled && "opacity-50"
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <div
        onClick={(e) => {
          if (disabled) return;
          if (!day) dayRef.current?.focus();
          else if (!month) monthRef.current?.focus();
          else yearRef.current?.focus();
        }}
        className={cn(
          "flex items-center px-4 py-2.5 rounded-xl border transition-all cursor-text",
          disabled ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed opacity-50" : "bg-white dark:bg-slate-900",
          error
            ? "border-red-500 ring-4 ring-red-500/10"
            : focused
            ? "border-primary-500 ring-4 ring-primary-500/10"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        )}
      >
        <div className="w-10">
          <input
            ref={dayRef}
            value={day}
            onChange={handleDayChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => handleKeyDown('day', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.day || 'DD'}
            autoComplete="off"
            disabled={disabled}
            inputMode="numeric"
            className="w-full bg-transparent border-none outline-none text-center text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
          />
        </div>
        
        <span className="mx-1 text-slate-400 select-none">/</span>
        
        <div className="w-10">
          <input
            ref={monthRef}
            value={month}
            onChange={handleMonthChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => handleKeyDown('month', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.month || 'MM'}
            autoComplete="off"
            disabled={disabled}
            inputMode="numeric"
            className="w-full bg-transparent border-none outline-none text-center text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
          />
        </div>
        
        <span className="mx-1 text-slate-400 select-none">/</span>
        
        <div className="w-14">
          <input
            ref={yearRef}
            value={year}
            onChange={handleYearChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => handleKeyDown('year', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.year || 'YYYY'}
            autoComplete="off"
            disabled={disabled}
            inputMode="numeric"
            className="w-full bg-transparent border-none outline-none text-center text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
          />
        </div>
      </div>

      {(helperText || error) && (
        <p className={cn("text-xs mt-1.5 font-medium px-1", error ? "text-red-500" : "text-slate-500")}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default DateInput;
