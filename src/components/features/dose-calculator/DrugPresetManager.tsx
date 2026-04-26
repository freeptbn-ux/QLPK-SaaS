'use client';

import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi2';
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
    const newPresets = [...presets];
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
    <div className="card mt-12 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Quản lý thuốc mẫu
        </h3>
        <button
          onClick={() => handleOpen()}
          className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Thêm thuốc mới
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-800/30">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4">Tên thuốc</th>
              <th className="px-6 py-4 text-right">Hàm lượng (mg)</th>
              <th className="px-6 py-4 text-right">Thể tích (ml)</th>
              <th className="px-6 py-4 text-right">Liều (mg/kg)</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {presets.map((preset, index) => (
              <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{preset.name}</td>
                <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-medium">{preset.mg}</td>
                <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-medium">{preset.ml}</td>
                <td className="px-6 py-4 text-right text-primary-600 dark:text-primary-400 font-bold">{preset.dose}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpen(index)}
                      className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {presets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                  Chưa có thuốc mẫu nào. Hãy thêm mới để sử dụng nhanh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Basic implementation since we don't have a shared Modal component yet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={handleClose}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                {editingIndex !== null ? '⚡ Sửa thuốc mẫu' : '➕ Thêm thuốc mẫu'}
              </h4>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Tên thuốc</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Hapacol 150mg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Hàm lượng (mg)</label>
                  <input
                    type="number"
                    value={formData.mg}
                    onChange={(e) => setFormData({ ...formData, mg: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Thể tích (ml)</label>
                  <input
                    type="number"
                    value={formData.ml}
                    onChange={(e) => setFormData({ ...formData, ml: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Liều chuẩn (mg/kg)</label>
                <input
                  type="number"
                  value={formData.dose}
                  onChange={(e) => setFormData({ ...formData, dose: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
              >
                <HiOutlineCheck className="w-5 h-5" />
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
