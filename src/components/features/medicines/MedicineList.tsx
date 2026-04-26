'use client';

import React, { useState, useMemo } from 'react';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineArchiveBox
} from 'react-icons/hi2';
import { Medicine } from '@/types/database';
import MedicineFormDialog from './MedicineFormDialog';
import StockAdjustDialog from './StockAdjustDialog';
import LowStockAlert from './LowStockAlert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteMedicine } from '@/actions/medicines';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';

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
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message || 'Không thể xóa thuốc');
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshData = async () => {
    window.location.reload(); 
  };

  return (
    <div className="space-y-6">
      <LowStockAlert 
        count={lowStockCount} 
        onFilterClick={() => setShowLowStockOnly(true)}
        isFiltered={showLowStockOnly}
        onClearFilter={() => setShowLowStockOnly(false)}
      />

      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-grow max-w-lg relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all border active:scale-95",
              showLowStockOnly 
                ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" 
                : "text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 dark:hover:bg-amber-900/20"
            )}
          >
            <HiOutlineArchiveBox className="w-5 h-5" />
            Sắp hết
          </button>
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Thêm thuốc
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12">
            <EmptyState 
              title={searchTerm || showLowStockOnly ? "Không tìm thấy thuốc phù hợp" : "Chưa có thuốc nào trong kho"}
              description={searchTerm || showLowStockOnly ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" : "Hãy thêm thuốc mới để bắt đầu quản lý"}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Tên thuốc</th>
                  <th className="px-6 py-4">Quy cách</th>
                  <th className="px-6 py-4 text-right">Giá (VNĐ)</th>
                  <th className="px-6 py-4 text-right">Tồn kho</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((medicine) => {
                  const isLowStock = medicine.stock_quantity <= medicine.min_stock_level;
                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                        {medicine.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {medicine.packing_spec || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {medicine.price.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={cn(
                            "font-bold",
                            isLowStock ? "text-red-500" : "text-gray-900 dark:text-gray-100"
                          )}>
                            {medicine.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(medicine)}
                            className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                            title="Nhập thêm/Điều chỉnh"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            Còn hàng
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(medicine)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}
