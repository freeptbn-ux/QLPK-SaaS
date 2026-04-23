'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Box,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Medicine } from '@/types/database';
import MedicineFormDialog from './MedicineFormDialog';
import StockAdjustDialog from './StockAdjustDialog';
import LowStockAlert from './LowStockAlert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteMedicine } from '@/actions/medicines';
import EmptyState from '@/components/ui/EmptyState';

interface MedicineListProps {
  initialData: Medicine[];
}

export default function MedicineList({ initialData }: MedicineListProps) {
  const [data, setData] = useState<Medicine[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = useMemo(() => {
    return data
      .filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLowStock = showLowStockOnly ? m.stock_quantity <= m.min_stock_level : true;
        return matchesSearch && matchesLowStock;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [data, searchTerm, showLowStockOnly]);

  const lowStockCount = useMemo(() => {
    return data.filter(m => m.stock_quantity <= m.min_stock_level).length;
  }, [data]);

  const handleAdd = () => {
    setSelectedMedicine(null);
    setFormOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormOpen(true);
  };

  const handleAdjustStock = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setStockOpen(true);
  };

  const handleDeleteClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedicine) return;
    setIsDeleting(true);
    try {
      await deleteMedicine(selectedMedicine.id);
      setData(data.filter((m) => m.id !== selectedMedicine.id));
      setConfirmOpen(false);
    } catch (error: any) {
      alert(error.message || 'Không thể xóa thuốc');
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshData = async () => {
    // In a real app with server actions, we might just revalidatePath
    // But since we are managing state locally for speed, let's just re-fetch or rely on revalidation
    // For simplicity, we'll just reload the page or update state if we had a fetch function
    // Since this is a client component, we'll need to update the data state.
    // For now, let's just trigger a router refresh in the parent or use a refresh callback.
    window.location.reload(); 
  };

  return (
    <Box>
      <LowStockAlert 
        count={lowStockCount} 
        onFilterClick={() => setShowLowStockOnly(true)}
        isFiltered={showLowStockOnly}
        onClearFilter={() => setShowLowStockOnly(false)}
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm thuốc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }
          }}
        />
        <Button
          variant={showLowStockOnly ? "contained" : "outlined"}
          color="warning"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          startIcon={<InventoryIcon />}
        >
          Thuốc sắp hết
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Thêm thuốc
        </Button>
      </Box>

      {filteredData.length === 0 ? (
        <EmptyState 
          title={searchTerm || showLowStockOnly ? "Không tìm thấy thuốc phù hợp" : "Chưa có thuốc nào trong kho"}
          description={searchTerm || showLowStockOnly ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" : "Hãy thêm thuốc mới để bắt đầu quản lý"}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên thuốc</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quy cách</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Giá (VNĐ)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tồn kho</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((medicine) => {
                const isLowStock = medicine.stock_quantity <= medicine.min_stock_level;
                return (
                  <TableRow key={medicine.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {medicine.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{medicine.packing_spec || '-'}</TableCell>
                    <TableCell align="right">
                      {medicine.price.toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: isLowStock ? 'error.main' : 'inherit'
                          }}
                        >
                          {medicine.stock_quantity}
                        </Typography>
                        <Tooltip title="Nhập thêm/Điều chỉnh">
                          <IconButton size="small" onClick={() => handleAdjustStock(medicine)} color="primary">
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isLowStock ? (
                        <Chip label="Sắp hết" color="error" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Còn hàng" color="success" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Sửa">
                          <IconButton onClick={() => handleEdit(medicine)} color="info">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton onClick={() => handleDeleteClick(medicine)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <MedicineFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        medicine={selectedMedicine}
        onSuccess={refreshData}
      />

      <StockAdjustDialog
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        medicine={selectedMedicine}
        onSuccess={refreshData}
      />

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa thuốc"
        message={`Bạn có chắc chắn muốn xóa thuốc "${selectedMedicine?.name}"? Hành động này không thể hoàn tác.`}
        loading={isDeleting}
      />
    </Box>
  );
}
