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
            <HiOutlineMagnifyingGlass className="h-5 w-5 text-slate-400" />
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
          <div className="p-20">
            <EmptyState 
              title={searchTerm || showLowStockOnly ? "Không tìm thấy thuốc phù hợp" : "Chưa có thuốc nào trong kho"}
              description={searchTerm || showLowStockOnly ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm đúng loại thuốc cần thiết" : "Hãy thêm thuốc mới vào danh mục để bắt đầu quản lý kho và kê đơn cho bệnh nhân"}
              icon={HiOutlineArchiveBox}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-5 font-bold tracking-tight whitespace-nowrap">Tên thuốc</th>
                  <th className="px-6 py-5 font-bold tracking-tight whitespace-nowrap">Quy cách</th>
                  <th className="px-6 py-5 font-bold tracking-tight text-right whitespace-nowrap">Giá (VNĐ)</th>
                  <th className="px-6 py-5 font-bold tracking-tight text-right whitespace-nowrap">Tồn kho</th>
                  <th className="px-6 py-5 font-bold tracking-tight text-center whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-5 font-bold tracking-tight text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((medicine) => {
                  const isLowStock = medicine.stock_quantity <= medicine.min_stock_level;
                  return (
                    <tr key={medicine.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors whitespace-nowrap">
                          {medicine.name}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">
                        {medicine.packing_spec || '-'}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {medicine.price.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={cn(
                            "font-bold text-base",
                            isLowStock ? "text-red-500" : "text-slate-900 dark:text-slate-100"
                          )}>
                            {medicine.stock_quantity}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(medicine)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                            title="Nhập thêm/Điều chỉnh"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            Còn hàng
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="Sửa"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          
                          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                          
                          <button
                            onClick={() => handleDeleteClick(medicine)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
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
