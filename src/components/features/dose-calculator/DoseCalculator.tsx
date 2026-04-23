'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
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
  IconButton,
  Stack,
  Grid
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
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 6, 
        maxWidth: 800, 
        mx: 'auto', 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(25, 118, 210, 0.02)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
          <CalculateIcon /> Công cụ tính liều
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              Chọn từ danh mục thuốc mẫu
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 3, bgcolor: 'grey.50' }}
              >
                <MenuItem value="">-- Tự nhập thông số --</MenuItem>
                {presets.map((p) => (
                  <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Hàm lượng & Thể tích</Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField 
                      fullWidth 
                      label="Hàm lượng (mg)" 
                      value={mg} 
                      onChange={(e) => setMg(e.target.value)}
                      type="number"
                      variant="filled"
                      slotProps={{ input: { sx: { borderRadius: '12px 12px 0 0' } } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField 
                      fullWidth 
                      label="Thể tích (ml)" 
                      value={ml} 
                      onChange={(e) => setMl(e.target.value)}
                      type="number"
                      variant="filled"
                      slotProps={{ input: { sx: { borderRadius: '12px 12px 0 0' } } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Thông số bệnh nhi</Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField 
                      fullWidth 
                      label="Liều chuẩn (mg/kg)" 
                      value={dosePerKg} 
                      onChange={(e) => setDosePerKg(e.target.value)}
                      type="number"
                      variant="filled"
                      slotProps={{ input: { sx: { borderRadius: '12px 12px 0 0' } } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField 
                      fullWidth 
                      label="Cân nặng (kg)" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      type="number"
                      variant="filled"
                      slotProps={{ input: { sx: { borderRadius: '12px 12px 0 0' } } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Tần suất sử dụng</Typography>
                <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <RadioGroup 
                    value={timesPerDay} 
                    onChange={(e) => setTimesPerDay(parseInt(e.target.value))}
                  >
                    <FormControlLabel value={1} control={<Radio />} label="1 lần / ngày" />
                    <FormControlLabel value={2} control={<Radio />} label="2 lần / ngày" />
                    <FormControlLabel value={3} control={<Radio />} label="3 lần / ngày" />
                  </RadioGroup>
                </Box>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={calculateDose}
                startIcon={<CalculateIcon />}
                sx={{ 
                  borderRadius: 4, 
                  py: 2, 
                  mt: { xs: 3, md: 0 },
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.2)',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                TÍNH KẾT QUẢ
              </Button>
            </Box>
          </Grid>
          
          {error && (
            <Grid size={12}>
              <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            </Grid>
          )}
          
          {result && (
            <Grid size={12}>
              <Box sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                borderRadius: 5, 
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 12px 24px rgba(25, 118, 210, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2, fontWeight: 700 }}>
                    KẾT QUẢ TÍNH TOÁN
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
                    {result.mlPerTime} <small style={{ fontSize: '1.2rem', fontWeight: 400 }}>ml / lần</small>
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Tổng liều: <strong>{result.totalMl} ml</strong> / ngày
                  </Typography>
                </Box>
                {/* Subtle background decoration */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                }} />
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>

  );
}
