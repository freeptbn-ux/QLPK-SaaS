'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Box, 
  Divider,
  Alert,
  IconButton
} from '@mui/material';
import { Settings as SettingsIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { getDrugPresets } from '@/actions/settings';

interface DrugPreset {
  name: string;
  mg: number;
  ml: number;
  dose: number;
}

export default function DoseCalculator() {
  const [presets, setPresets] = useState<DrugPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  const [mg, setMg] = useState<string>('');
  const [ml, setMl] = useState<string>('');
  const [dosePerKg, setDosePerKg] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [timesPerDay, setTimesPerDay] = useState<number>(3);
  
  const [result, setResult] = useState<{ mlPerTime: string; totalMl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrugPresets().then(setPresets);
  }, []);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setMg(preset.mg.toString());
      setMl(preset.ml.toString());
      setDosePerKg(preset.dose.toString());
    }
  };

  const calculateDose = () => {
    setError(null);
    setResult(null);

    const nMg = parseFloat(mg);
    const nMl = parseFloat(ml);
    const nDose = parseFloat(dosePerKg);
    const nWeight = parseFloat(weight);

    if (isNaN(nMg) || isNaN(nMl) || isNaN(nDose) || isNaN(nWeight) || nMg <= 0 || nMl <= 0 || nDose <= 0 || nWeight <= 0) {
      setError('Vui lòng nhập đầy đủ các thông số hợp lệ (số dương)');
      return;
    }

    // Công thức: total_ml = (dose_per_kg * weight * ml) / mg
    const totalMl = (nDose * nWeight * nMl) / nMg;
    const mlPerTime = totalMl / timesPerDay;

    setResult({
      mlPerTime: mlPerTime.toFixed(2),
      totalMl: totalMl.toFixed(2)
    });
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon color="primary" /> Công cụ tính liều
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Chọn thuốc mẫu</InputLabel>
              <Select
                value={selectedPreset}
                label="Chọn thuốc mẫu"
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <MenuItem value="">-- Tự nhập --</MenuItem>
                {presets.map((p) => (
                  <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={6}>
            <TextField 
              fullWidth 
              label="Hàm lượng (mg)" 
              value={mg} 
              onChange={(e) => setMg(e.target.value)}
              type="number"
              size="small"
            />
          </Grid>
          <Grid size={6}>
            <TextField 
              fullWidth 
              label="Thể tích (ml)" 
              value={ml} 
              onChange={(e) => setMl(e.target.value)}
              type="number"
              size="small"
            />
          </Grid>
          <Grid size={6}>
            <TextField 
              fullWidth 
              label="Liều chuẩn (mg/kg)" 
              value={dosePerKg} 
              onChange={(e) => setDosePerKg(e.target.value)}
              type="number"
              size="small"
            />
          </Grid>
          <Grid size={6}>
            <TextField 
              fullWidth 
              label="Cân nặng (kg)" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              type="number"
              size="small"
            />
          </Grid>
          
          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>Số lần chia trong ngày:</Typography>
            <RadioGroup 
              row 
              value={timesPerDay} 
              onChange={(e) => setTimesPerDay(parseInt(e.target.value))}
            >
              <FormControlLabel value={1} control={<Radio />} label="1 lần" />
              <FormControlLabel value={2} control={<Radio />} label="2 lần" />
              <FormControlLabel value={3} control={<Radio />} label="3 lần" />
            </RadioGroup>
          </Grid>
          
          <Grid size={12}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={calculateDose}
              startIcon={<CalculateIcon />}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              TÍNH NGAY
            </Button>
          </Grid>
          
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          
          {result && (
            <Grid size={12}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'primary.light', 
                borderRadius: 4, 
                textAlign: 'center',
                color: 'primary.contrastText',
                boxShadow: 2
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {result.mlPerTime} ml / lần
                </Typography>
                <Typography variant="subtitle1">
                  Tổng liều: {result.totalMl} ml / ngày
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
