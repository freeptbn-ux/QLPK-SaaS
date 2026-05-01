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
      <td className="px-4 py-3 min-w-[80px] w-[100px]">
        <input
          type="number"
          min="1"
          value={item.quantity === 0 ? '' : item.quantity}
          onChange={(e) => {
            const val = e.target.value;
            onUpdate(index, { quantity: val === '' ? 0 : parseInt(val) || 0 });
          }}
          className="input-field py-1 px-2 text-center"
        />
      </td>
      <td className="px-4 py-3 min-w-[140px]">
        <div className="relative">
          <input
            type="number"
            value={item.unit_price === 0 ? '' : item.unit_price}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate(index, { unit_price: val === '' ? 0 : parseInt(val) || 0 });
            }}
            className="input-field py-1 pl-2 pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
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
