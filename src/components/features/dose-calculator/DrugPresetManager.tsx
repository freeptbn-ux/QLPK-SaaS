'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getDrugPresets, saveDrugPresets } from '@/actions/settings';

interface DrugPreset {
  name: string;
  mg: number;
  ml: number;
  dose: number;
}

export default function DrugPresetManager() {
  const [presets, setPresets] = useState<DrugPreset[]>([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DrugPreset>({ name: '', mg: 0, ml: 0, dose: 0 });

  useEffect(() => {
    getDrugPresets().then(setPresets);
  }, []);

  const handleOpen = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setFormData(presets[index]);
    } else {
      setEditingIndex(null);
      setFormData({ name: '', mg: 0, ml: 0, dose: 0 });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    let newPresets = [...presets];
    if (editingIndex !== null) {
      newPresets[editingIndex] = formData;
    } else {
      newPresets.push(formData);
    }
    setPresets(newPresets);
    await saveDrugPresets(newPresets);
    handleClose();
  };

  const handleDelete = async (index: number) => {
    if (confirm('Bạn có chắc muốn xóa thuốc mẫu này?')) {
      const newPresets = presets.filter((_, i) => i !== index);
      setPresets(newPresets);
      await saveDrugPresets(newPresets);
    }
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 6, 
        mt: 4, 
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0, 0, 0, 0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Quản lý thuốc mẫu</Typography>
        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          onClick={() => handleOpen()}
          sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
        >
          Thêm thuốc mới
        </Button>
      </Box>
      
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 2 }}>Tên thuốc</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Hàm lượng (mg)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Thể tích (ml)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Liều (mg/kg)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {presets.map((preset, index) => (
                <TableRow 
                  key={index}
                  sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.02)' }, transition: 'background-color 0.2s' }}
                >
                  <TableCell sx={{ py: 2, fontWeight: 500 }}>{preset.name}</TableCell>
                  <TableCell align="right">{preset.mg}</TableCell>
                  <TableCell align="right">{preset.ml}</TableCell>
                  <TableCell align="right">{preset.dose}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpen(index)} 
                        sx={{ color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.08)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.15)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(index)} 
                        sx={{ color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.08)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.15)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {presets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    Chưa có thuốc mẫu nào. Hãy thêm mới để sử dụng nhanh.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={open} 
          onClose={handleClose} 
          fullWidth 
          maxWidth="xs"
          slotProps={{
            paper: {
              sx: { borderRadius: 5, p: 1 }
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            {editingIndex !== null ? '⚡ Sửa thuốc mẫu' : '➕ Thêm thuốc mẫu'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField 
                label="Tên thuốc" 
                fullWidth 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField 
                    label="Hàm lượng (mg)" 
                    type="number" 
                    fullWidth 
                    value={formData.mg}
                    onChange={(e) => setFormData({ ...formData, mg: parseFloat(e.target.value) })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField 
                    label="Thể tích (ml)" 
                    type="number" 
                    fullWidth 
                    value={formData.ml}
                    onChange={(e) => setFormData({ ...formData, ml: parseFloat(e.target.value) })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Liều chuẩn (mg/kg)" 
                type="number" 
                fullWidth 
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: parseFloat(e.target.value) })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleClose} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>Hủy bỏ</Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 700 }}
            >
              Lưu thông tin
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
