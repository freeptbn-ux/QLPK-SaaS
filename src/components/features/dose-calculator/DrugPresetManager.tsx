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
  Box
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
    <Card elevation={2} sx={{ borderRadius: 4, mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Quản lý thuốc mẫu</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => handleOpen()}>
            Thêm thuốc
          </Button>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên thuốc</TableCell>
                <TableCell align="right">Hàm lượng (mg)</TableCell>
                <TableCell align="right">Thể tích (ml)</TableCell>
                <TableCell align="right">Liều (mg/kg)</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {presets.map((preset, index) => (
                <TableRow key={index}>
                  <TableCell>{preset.name}</TableCell>
                  <TableCell align="right">{preset.mg}</TableCell>
                  <TableCell align="right">{preset.ml}</TableCell>
                  <TableCell align="right">{preset.dose}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpen(index)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(index)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle>{editingIndex !== null ? 'Sửa thuốc mẫu' : 'Thêm thuốc mẫu'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField 
                label="Tên thuốc" 
                fullWidth 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField 
                label="Hàm lượng (mg)" 
                type="number" 
                fullWidth 
                value={formData.mg}
                onChange={(e) => setFormData({ ...formData, mg: parseFloat(e.target.value) })}
              />
              <TextField 
                label="Thể tích (ml)" 
                type="number" 
                fullWidth 
                value={formData.ml}
                onChange={(e) => setFormData({ ...formData, ml: parseFloat(e.target.value) })}
              />
              <TextField 
                label="Liều chuẩn (mg/kg)" 
                type="number" 
                fullWidth 
                value={formData.dose}
                onChange={(e) => setFormData({ ...formData, dose: parseFloat(e.target.value) })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
