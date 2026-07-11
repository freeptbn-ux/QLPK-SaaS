'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiChevronUpDown, HiChevronUp, HiChevronDown, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getMedicineUsageByPatient } from '@/actions/patients';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

interface MedicineUsageDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

type SortKey = 'medicine_name' | 'times_prescribed';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

export default function MedicineUsageDialog({ open, onClose, patientId, patientName }: MedicineUsageDialogProps) {
  const [data, setData] = useState<{ 
    medicine_name: string; 
    packing_spec: string | null; 
    times_prescribed: number 
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      setSortConfig(null); // Reset sort when opening
      setIsSearching(false);
      setSearchQuery('');
      setDebouncedQuery('');
      getMedicineUsageByPatient(patientId)
        .then(setData)
        .catch(err => {
          console.error('Failed to fetch medicine usage:', err);
          setData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, patientId]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (key === 'medicine_name') {
          if (current.direction === 'asc') return { key, direction: 'desc' };
          return null;
        } else {
          // times_prescribed: Desc -> Asc -> Null
          if (current.direction === 'desc') return { key, direction: 'asc' };
          return null;
        }
      }
      // Initial sort: Name (Asc), Times (Desc)
      return { key, direction: key === 'medicine_name' ? 'asc' : 'desc' };
    });
  };

  const filteredData = useMemo(() => {
    // 1. Filter
    let result = data;
    if (debouncedQuery.trim()) {
      const queryLower = debouncedQuery.toLowerCase().trim();
      const queryClean = removeAccents(queryLower);

      result = data.filter(item => {
        const nameLower = item.medicine_name.toLowerCase();
        const nameClean = removeAccents(nameLower);

        const specLower = (item.packing_spec || '').toLowerCase();
        const specClean = removeAccents(specLower);

        return (
          nameLower.includes(queryLower) ||
          nameClean.includes(queryClean) ||
          (item.packing_spec && (specLower.includes(queryLower) || specClean.includes(queryClean)))
        );
      });
    }

    // 2. Sort
    if (!sortConfig) return result;

    return [...result].sort((a, b) => {
      const { key, direction } = sortConfig;
      const modifier = direction === 'asc' ? 1 : -1;

      if (key === 'medicine_name') {
        return a.medicine_name.localeCompare(b.medicine_name, 'vi') * modifier;
      }
      if (key === 'times_prescribed') {
        return (a.times_prescribed - b.times_prescribed) * modifier;
      }
      return 0;
    });
  }, [data, debouncedQuery, sortConfig]);

  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <HiChevronUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />;
    if (sortConfig.direction === 'asc') return <HiChevronUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
    return <HiChevronDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <h3 
                  title={`Lịch sử dùng thuốc: ${patientName}`}
                  className="text-lg font-bold text-gray-900 dark:text-white whitespace-normal line-clamp-2"
                >
                  Lịch sử dùng thuốc: {patientName}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setIsSearching(!isSearching);
                      if (isSearching) {
                        setSearchQuery('');
                        setDebouncedQuery('');
                      }
                    }}
                    className={cn(
                      "p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors",
                      isSearching && "text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-800"
                    )}
                    aria-label="Toggle search"
                  >
                    <HiOutlineMagnifyingGlass className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <HiOutlineXMark className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mt-2">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm thuốc..."
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setDebouncedQuery('');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Clear search"
                        >
                          <HiOutlineXMark className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="flex justify-center py-12">
                   <BallLoader size="md" text="Đang tải lịch sử dùng thuốc..." />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Chưa có lịch sử dùng thuốc</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Không tìm thấy thuốc khớp với từ khóa</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      <tr>
                        <th 
                          onClick={() => handleSort('medicine_name')}
                          className="px-4 py-3 text-left font-semibold cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            Tên thuốc
                            {getSortIcon('medicine_name')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('times_prescribed')}
                          className="px-4 py-3 text-center font-semibold w-24 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-center justify-center gap-2">
                            Số lần
                            {getSortIcon('times_prescribed')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredData.map((row, index) => {
                        const isBold = row.times_prescribed >= 3;
                        return (
                          <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className={cn(
                              "px-4 py-3",
                              isBold && "font-bold text-primary-700 dark:text-primary-400"
                            )}>
                              <div>{row.medicine_name}</div>
                              {row.packing_spec && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                  {row.packing_spec}
                                </div>
                              )}
                            </td>
                            <td className={cn(
                              "px-4 py-3 text-center",
                              isBold && "font-bold text-primary-700 dark:text-primary-400"
                            )}>
                              {row.times_prescribed}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
