'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress, Typography, Box } from '@mui/material';
import { getMedicines } from '@/actions/medicines';
import { Medicine } from '@/types/database';
import debounce from 'lodash/debounce';

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine | null) => void;
  excludeIds?: number[];
}

export default function MedicineAutocomplete({ onSelect, excludeIds = [] }: MedicineAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const fetchMedicines = useCallback(
    debounce(async (query: string) => {
      setLoading(true);
      try {
        const results = await getMedicines(query);
        // Filter out already selected medicines
        const filtered = results.filter((m: Medicine) => !excludeIds.includes(m.id));
        setOptions(filtered);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [excludeIds]
  );

  useEffect(() => {
    if (open) {
      fetchMedicines(inputValue);
    }
  }, [inputValue, open, fetchMedicines]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(_, newValue) => {
        onSelect(newValue);
        if (newValue) {
          setInputValue('');
        }
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.packing_spec} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.price)} - Tồn: {option.stock_quantity}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tìm thuốc..."
          placeholder="Nhập tên thuốc để tìm"
          fullWidth
          size="small"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.slotProps.input.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
    />
  );
}
