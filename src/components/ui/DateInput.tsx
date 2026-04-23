'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  styled,
  useTheme,
} from '@mui/material';

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

const InputContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'focused' && prop !== 'disabled',
})<{ error?: boolean; focused?: boolean; disabled?: boolean }>(({ theme, error, focused, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8.5px 14px',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid',
  borderColor: error
    ? theme.palette.error.main
    : focused
    ? theme.palette.primary.main
    : theme.palette.mode === 'light'
    ? 'rgba(0, 0, 0, 0.23)'
    : 'rgba(255, 255, 255, 0.23)',
  backgroundColor: disabled ? (theme.palette.mode === 'light' ? '#f5f5f5' : '#1e293b') : 'transparent',
  cursor: disabled ? 'not-allowed' : 'text',
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  '&:hover': {
    borderColor: error
      ? theme.palette.error.main
      : focused
      ? theme.palette.primary.main
      : theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.87)'
      : 'rgba(255, 255, 255, 0.87)',
  },
  ...(focused && {
    boxShadow: `0 0 0 1px ${error ? theme.palette.error.main : theme.palette.primary.main}`,
  }),
}));

const StyledInput = styled('input')(({ theme }) => ({
  border: 'none',
  outline: 'none',
  padding: 0,
  margin: 0,
  width: '100%',
  background: 'transparent',
  textAlign: 'center',
  fontSize: '1rem',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  '&::placeholder': {
    color: theme.palette.text.disabled,
    opacity: 1,
  },
  '&:disabled': {
    cursor: 'not-allowed',
    color: theme.palette.text.disabled,
  },
}));

const Separator = styled(Typography)(({ theme }) => ({
  margin: '0 4px',
  color: theme.palette.text.secondary,
  userSelect: 'none',
}));

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
  const theme = useTheme();
  
  // Use a ref to track the last value we emitted to avoid loops
  const lastEmittedValue = useRef(value);

  // Split value into parts
  const parts = value.includes('/') ? value.split('/') : ['', '', ''];
  const day = parts[0] || '';
  const month = parts[1] || '';
  const year = parts[2] || '';

  const [focused, setFocused] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const updateParent = (d: string, m: string, y: string) => {
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
    <FormControl error={error} required={required} disabled={disabled} fullWidth variant="standard">
      {label && (
        <InputLabel
          shrink
          sx={{
            position: 'relative',
            transform: 'none',
            marginBottom: '8px',
            color: error ? theme.palette.error.main : focused ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </InputLabel>
      )}
      <InputContainer
        focused={focused}
        error={error}
        disabled={disabled}
        onClick={() => {
          if (!day) dayRef.current?.focus();
          else if (!month) monthRef.current?.focus();
          else yearRef.current?.focus();
        }}
      >
        <Box sx={{ width: '35px' }}>
          <StyledInput
            ref={dayRef}
            value={day}
            onChange={handleDayChange}
            onKeyDown={(e) => handleKeyDown('day', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.day || 'DD'}
            disabled={disabled}
            inputMode="numeric"
          />
        </Box>
        <Separator>/</Separator>
        <Box sx={{ width: '35px' }}>
          <StyledInput
            ref={monthRef}
            value={month}
            onChange={handleMonthChange}
            onKeyDown={(e) => handleKeyDown('month', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.month || 'MM'}
            disabled={disabled}
            inputMode="numeric"
          />
        </Box>
        <Separator>/</Separator>
        <Box sx={{ width: '55px' }}>
          <StyledInput
            ref={yearRef}
            value={year}
            onChange={handleYearChange}
            onKeyDown={(e) => handleKeyDown('year', e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder.year || 'YYYY'}
            disabled={disabled}
            inputMode="numeric"
          />
        </Box>
      </InputContainer>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DateInput;
