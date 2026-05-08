'use client';

import React from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import { PrescriptionItem } from '@/types/forms';

interface PrescriptionItemRowProps {
  item: PrescriptionItem;
  index: number;
  onUpdate: (index: number, updates: Partial<PrescriptionItem>) => void;
  onRemove: (index: number) => void;
}

const PrescriptionItemRow = React.memo(function PrescriptionItemRow({ item, index, onUpdate, onRemove }: PrescriptionItemRowProps) {
  const total = item.quantity * item.unit_price;

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <td className="px-4 py-3 min-w-[200px]">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {item.medicine_name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {item.packing_spec}
        </div>
      </td>
      <td className="px-2 py-3 min-w-[60px] sm:min-w-[80px] max-w-[80px]">
        <input
          type="number"
          min="1"
          value={item.quantity === 0 ? '' : item.quantity}
          onChange={(e) => {
            const val = e.target.value;
            onUpdate(index, { quantity: val === '' ? 0 : parseInt(val) || 0 });
          }}
          className="input-field py-1 px-1 sm:px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </td>
      <td className="px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Intl.NumberFormat('vi-VN').format(item.unit_price)}
          </span>
          <span className="text-xs text-gray-400">đ</span>
        </div>
      </td>
      <td className="px-4 py-3 min-w-[120px] text-right">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {new Intl.NumberFormat('vi-VN').format(total)}
        </span>
      </td>
      <td className="px-4 py-3 w-[50px] text-right">
        <button
          onClick={() => onRemove(index)}
          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90"
          title="Xóa thuốc"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});

export default PrescriptionItemRow;
