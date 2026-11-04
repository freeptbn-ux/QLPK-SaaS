'use client';

import React, { useState, useEffect, useRef, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineXMark, 
  HiOutlineArrowUpTray, 
  HiOutlineDocumentArrowUp,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
  HiOutlinePlusCircle
} from 'react-icons/hi2';
import { Medicine, MedicineAlias } from '@/types/database';
import { 
  importMedicineStockBatch, 
  saveMedicineAliases, 
  getMedicineAliases 
} from '@/actions/medicines';
import { 
  useMedicineCatalog, 
  invalidateMedicineCatalog 
} from '@/hooks/useMedicineCatalog';
import { 
  parseSpreadsheet, 
  matchMedicineRows, 
  ParsedSpreadsheetRow,
  MatchedMedicineRow,
  CandidateSuggestion 
} from '@/lib/pharma';
import { removeDiacritics } from '@/lib/utils/normalize';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils/cn';

export interface ReconciliationItem {
  id: string;
  rawRow: ParsedSpreadsheetRow;
  confidenceStatus: 'CONFIDENT' | 'SUGGESTED' | 'UNMATCHED';
  candidateSuggestions: CandidateSuggestion[];
  selectedMedicineId: number | null;
  selectedMedicine: Medicine | null;
  isCreateNew: boolean;
  isManuallyReassigned: boolean;
  userConfirmed: boolean;
}

export interface MedicineImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  catalog?: Medicine[];
  aliases?: MedicineAlias[];
}

export type TableFilter = 'all' | 'suggested' | 'unmatched';

export default function MedicineImportModal({
  open,
  onClose,
  onSuccess,
  catalog: propCatalog,
  aliases: propAliases,
}: MedicineImportModalProps) {
  // Safe toast helper in case rendered outside ToastProvider
  let toast: { showToast: (msg: string, sev?: any) => void } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    toast = useToast();
  } catch {
    // Fallback when outside ToastProvider
  }

  // Hook catalog data
  const catalogHook = useMedicineCatalog();
  const activeCatalog = propCatalog || catalogHook.medicines;

  // State
  const [loadedAliases, setLoadedAliases] = useState<MedicineAlias[]>(propAliases || []);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [filter, setFilter] = useState<TableFilter>('all');
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load aliases if not provided
  useEffect(() => {
    if (propAliases) {
      setLoadedAliases(propAliases);
    } else if (open) {
      getMedicineAliases()
        .then((data) => setLoadedAliases(data || []))
        .catch(() => setLoadedAliases([]));
    }
  }, [open, propAliases]);

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setError(null);
      setFilter('all');
      setActiveSearchRowId(null);
      setSearchQuery('');
    } else {
      setFile(null);
      setFileName('');
      setItems([]);
      setIsProcessingFile(false);
      setIsSubmitting(false);
      setError(null);
      setActiveSearchRowId(null);
    }
  }, [open]);

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isSubmitting, onClose]);

  // Handle file selection and parsing
  const processSpreadsheetFile = async (selectedFile: File) => {
    setIsProcessingFile(true);
    setError(null);
    try {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      const parsedRows = await parseSpreadsheet(selectedFile);
      if (!parsedRows || parsedRows.length === 0) {
        throw new Error('File bảng tính không có dữ liệu thuốc hợp lệ.');
      }

      const matchedRows = matchMedicineRows(parsedRows, activeCatalog, loadedAliases);

      const initialItems: ReconciliationItem[] = matchedRows.map((m, idx) => ({
        id: `item-${idx + 1}-${m.rawRow.rowIndex}`,
        rawRow: m.rawRow,
        confidenceStatus: m.confidenceStatus,
        candidateSuggestions: m.candidateSuggestions || [],
        selectedMedicineId: m.matchedMedicineId,
        selectedMedicine: m.matchedMedicine,
        isCreateNew: false,
        isManuallyReassigned: false,
        userConfirmed: m.confidenceStatus === 'CONFIDENT',
      }));

      setItems(initialItems);
    } catch (err: any) {
      console.error('Lỗi khi đọc file bảng tính:', err);
      setError(err?.message || 'Không thể đọc file bảng tính. Vui lòng kiểm tra lại định dạng file.');
      setFile(null);
      setFileName('');
      setItems([]);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSpreadsheetFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (chosenFile) {
      processSpreadsheetFile(chosenFile);
    }
  };

  // Manual medicine reassignment
  const handleSelectMedicine = (itemId: string, medicine: Medicine) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          selectedMedicineId: medicine.id,
          selectedMedicine: medicine,
          isCreateNew: false,
          isManuallyReassigned: true,
          userConfirmed: true,
        };
      })
    );
    setActiveSearchRowId(null);
    setSearchQuery('');
  };

  // Toggle "Tạo thuốc mới"
  const handleToggleCreateNew = (itemId: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (checked) {
          return {
            ...item,
            isCreateNew: true,
            selectedMedicineId: null,
            selectedMedicine: null,
            userConfirmed: true,
          };
        } else {
          // Restore candidate if available
          const fallbackMed = item.candidateSuggestions[0]?.medicine || null;
          return {
            ...item,
            isCreateNew: false,
            selectedMedicineId: fallbackMed?.id || null,
            selectedMedicine: fallbackMed,
            isManuallyReassigned: false,
          };
        }
      })
    );
  };

  // Filtered rows
  const filteredItems = useMemo(() => {
    if (filter === 'suggested') {
      return items.filter((it) => it.confidenceStatus === 'SUGGESTED' && !it.isCreateNew);
    }
    if (filter === 'unmatched') {
      return items.filter((it) => it.confidenceStatus === 'UNMATCHED' && !it.isCreateNew);
    }
    return items;
  }, [items, filter]);

  // Counts
  const confidentCount = items.filter((it) => it.confidenceStatus === 'CONFIDENT' && !it.isCreateNew).length;
  const suggestedCount = items.filter((it) => it.confidenceStatus === 'SUGGESTED' && !it.isCreateNew).length;
  const unmatchedCount = items.filter((it) => it.confidenceStatus === 'UNMATCHED' && !it.isCreateNew).length;
  const createNewCount = items.filter((it) => it.isCreateNew).length;

  // Filter catalog for active autocomplete search
  const filteredCatalogMedicines = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCatalog.slice(0, 20);
    }
    const cleanQuery = removeDiacritics(searchQuery.toLowerCase().trim());
    return activeCatalog
      .filter((med) => {
        const cleanName = removeDiacritics(med.name.toLowerCase());
        const cleanSpec = med.packing_spec ? removeDiacritics(med.packing_spec.toLowerCase()) : '';
        return cleanName.includes(cleanQuery) || cleanSpec.includes(cleanQuery);
      })
      .slice(0, 20);
  }, [activeCatalog, searchQuery]);

  // Commit batch import
  const handleConfirmImport = async () => {
    const adjustments: Array<{ medicine_id: number; quantity: number }> = [];
    const newMedicines: Array<{
      name: string;
      packing_spec?: string;
      unit?: string;
      price?: number;
      initial_stock: number;
    }> = [];
    const confirmedAliases: Array<{ raw_name: string; medicine_id: number }> = [];

    for (const item of items) {
      if (item.isCreateNew) {
        newMedicines.push({
          name: item.rawRow.name,
          packing_spec: item.rawRow.spec || undefined,
          unit: item.rawRow.spec || 'Đơn vị',
          price: item.rawRow.price !== undefined ? Math.max(0, item.rawRow.price) : 0,
          initial_stock: Math.max(0, Math.round(item.rawRow.quantity)),
        });
      } else if (item.selectedMedicineId !== null) {
        adjustments.push({
          medicine_id: item.selectedMedicineId,
          quantity: Math.max(1, Math.round(item.rawRow.quantity)),
        });

        // Record confirmed alias if manually reassigned or confirmed suggested
        if (item.isManuallyReassigned || item.confidenceStatus === 'SUGGESTED') {
          confirmedAliases.push({
            raw_name: item.rawRow.name,
            medicine_id: item.selectedMedicineId,
          });
        }
      }
    }

    if (adjustments.length === 0 && newMedicines.length === 0) {
      setError('Không có thuốc nào được chọn hoặc tạo mới để nhập kho.');
      return;
    }

    // Deduplicate confirmed aliases by raw_name
    const seenRawNames = new Set<string>();
    const dedupedAliases: Array<{ raw_name: string; medicine_id: number }> = [];
    for (const alias of confirmedAliases) {
      const key = alias.raw_name.trim().toLowerCase();
      if (!seenRawNames.has(key)) {
        seenRawNames.add(key);
        dedupedAliases.push(alias);
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await importMedicineStockBatch({
        adjustments,
        newMedicines,
        reason: 'IMPORT_EXCEL',
      });

      if (dedupedAliases.length > 0) {
        try {
          await saveMedicineAliases(dedupedAliases);
        } catch (aliasErr) {
          console.warn('Lỗi lưu danh mục bí danh thuốc:', aliasErr);
        }
      }

      await Promise.resolve(invalidateMedicineCatalog?.()).catch(() => {});

      const updatedCount = res?.updated_count ?? adjustments.length;
      const createdCount = res?.created_count ?? newMedicines.length;

      toast?.showToast?.(
        `Nhập kho thành công! Đã cập nhật ${updatedCount} thuốc tồn kho${createdCount > 0 ? ` và tạo mới ${createdCount} thuốc` : ''}.`,
        'success'
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi thực hiện nhập kho hàng loạt:', err);
      setError(err?.message || 'Có lỗi xảy ra trong quá trình cập nhật kho. Dữ liệu đã chọn được giữ nguyên để bạn kiểm tra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                  <HiOutlineDocumentArrowUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 id="import-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Nhập thuốc từ file Excel / CSV
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {items.length === 0 
                      ? 'Tải lên bảng tính để tự động đối soát và cập nhật số lượng tồn kho'
                      : `Đang xem file: ${fileName} (${items.length} mặt hàng)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileName('');
                      setItems([]);
                      setError(null);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Chọn file khác
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Đóng"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div 
                role="alert" 
                className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 shrink-0"
              >
                <HiOutlineXCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-red-800 dark:text-red-200 font-medium">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 min-h-0">
              {items.length === 0 ? (
                /* Step 1: Upload View / Dropzone */
                <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    aria-label="Tải lên file bảng tính"
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Vùng kéo thả file bảng tính. Bấm Enter hoặc Space để chọn file từ máy tính."
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group focus:outline-none focus:ring-4 focus:ring-emerald-500/20",
                      isDragging
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]"
                        : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div className="p-4 rounded-3xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      {isProcessingFile ? (
                        <HiOutlineArrowPath className="w-10 h-10 animate-spin" />
                      ) : (
                        <HiOutlineArrowUpTray className="w-10 h-10" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {isProcessingFile
                          ? 'Đang phân tích bảng tính và so khớp danh mục...'
                          : 'Kéo thả file bảng tính vào đây, hoặc nhấn để chọn file'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Hỗ trợ Microsoft Excel (<span className="font-semibold text-slate-700 dark:text-slate-300">.xlsx, .xls</span>) và <span className="font-semibold text-slate-700 dark:text-slate-300">.csv</span>
                      </p>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                      Tự động nhận diện cột Tên thuốc, Số lượng, Đơn vị, Quy cách, Đơn giá
                    </div>
                  </div>

                  <div aria-live="polite" className="sr-only">
                    {isProcessingFile && 'Đang xử lý file bảng tính.'}
                  </div>
                </div>
              ) : (
                /* Step 2: Interactive Reconciliation Review Table */
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  {/* Summary Status Badges & Filter Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                    {/* Summary Counters */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Tổng cộng: <strong className="text-slate-900 dark:text-slate-100 font-bold">{items.length}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span>🟢</span> Khớp chính xác: {confidentCount}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span>🟡</span> Cần kiểm tra: {suggestedCount}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <span>🔴</span> Chưa khớp: {unmatchedCount}
                      </span>
                      {createNewCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          <span>🔵</span> Tạo mới: {createNewCount}
                        </span>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all",
                          filter === 'all'
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        )}
                      >
                        Tất cả ({items.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilter('suggested')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all",
                          filter === 'suggested'
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        )}
                      >
                        Cần kiểm tra ({suggestedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilter('unmatched')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all",
                          filter === 'unmatched'
                            ? "bg-red-500 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        )}
                      >
                        Chưa khớp ({unmatchedCount})
                      </button>
                    </div>
                  </div>

                  {/* Reconciliation Table */}
                  <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase w-12 text-center">#</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase min-w-[200px]">Tên trong file Excel</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase min-w-[260px]">Thuốc trong kho phòng khám</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase text-right whitespace-nowrap">Tồn hiện tại</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase text-right whitespace-nowrap">+SL nhập</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase text-right whitespace-nowrap">=Tồn mới</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase text-center whitespace-nowrap">Trạng thái</th>
                          <th className="px-4 py-3.5 font-bold tracking-tight text-xs uppercase text-center whitespace-nowrap">Tùy chọn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredItems.map((item, idx) => {
                          const currentStock = item.isCreateNew 
                            ? 0 
                            : (item.selectedMedicine ? item.selectedMedicine.stock_quantity : null);
                          const quantity = item.rawRow.quantity;
                          const resultingStock = currentStock !== null ? currentStock + quantity : null;

                          const isSearchOpen = activeSearchRowId === item.id;

                          return (
                            <tr 
                              key={item.id} 
                              className={cn(
                                "group transition-colors",
                                item.isCreateNew
                                  ? "bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40"
                                  : item.confidenceStatus === 'SUGGESTED'
                                  ? "bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/40"
                                  : item.confidenceStatus === 'UNMATCHED'
                                  ? "bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50/40"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              )}
                            >
                              {/* Row Index */}
                              <td className="px-4 py-3.5 text-center text-xs font-mono text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Raw Name from Excel */}
                              <td className="px-4 py-3.5">
                                <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {item.rawRow.name}
                                </div>
                                {(item.rawRow.spec || item.rawRow.brand || item.rawRow.price) && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
                                    {item.rawRow.spec && <span>QC: {item.rawRow.spec}</span>}
                                    {item.rawRow.brand && <span>• Hãng: {item.rawRow.brand}</span>}
                                    {item.rawRow.price !== undefined && <span>• Giá: {item.rawRow.price.toLocaleString('vi-VN')}đ</span>}
                                  </div>
                                )}
                              </td>

                              {/* Target Clinic Medicine Selector */}
                              <td className="px-4 py-3.5">
                                {isSearchOpen ? (
                                  /* Inline Autocomplete Search Box */
                                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-primary-300 dark:border-primary-700 shadow-xl space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400" />
                                      <input
                                        type="text"
                                        role="searchbox"
                                        aria-label="Tìm thuốc trong kho"
                                        placeholder="Gõ tên thuốc cần tìm trong kho..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveSearchRowId(null);
                                          setSearchQuery('');
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        title="Đóng tìm kiếm"
                                        aria-label="Đóng tìm kiếm"
                                      >
                                        <HiOutlineXMark className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Suggested Candidates if query empty */}
                                    {!searchQuery.trim() && item.candidateSuggestions.length > 0 && (
                                      <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                          Gợi ý phù hợp nhất:
                                        </div>
                                        {item.candidateSuggestions.map((cand) => (
                                          <button
                                            key={`sug-${cand.medicine.id}`}
                                            type="button"
                                            onClick={() => handleSelectMedicine(item.id, cand.medicine)}
                                            className="w-full text-left p-1.5 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between group"
                                          >
                                            <div>
                                              <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
                                                {cand.medicine.name}
                                              </span>
                                              {cand.medicine.packing_spec && (
                                                <span className="text-[11px] text-slate-400 ml-1">
                                                  ({cand.medicine.packing_spec})
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                              Tồn: {cand.medicine.stock_quantity}
                                            </span>
                                          </button>
                                        ))}
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                      </div>
                                    )}

                                    {/* Full Catalog Filtered List */}
                                    <div className="max-h-36 overflow-y-auto space-y-1">
                                      {filteredCatalogMedicines.length === 0 ? (
                                        <div className="text-xs text-slate-400 py-2 text-center">
                                          Không tìm thấy thuốc khớp từ khóa
                                        </div>
                                      ) : (
                                        filteredCatalogMedicines.map((med) => (
                                          <button
                                            key={`med-${med.id}`}
                                            type="button"
                                            onClick={() => handleSelectMedicine(item.id, med)}
                                            className="w-full text-left p-1.5 rounded-lg text-xs hover:bg-primary-50 dark:hover:bg-primary-950/40 flex items-center justify-between group"
                                          >
                                            <div>
                                              <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600">
                                                {med.name}
                                              </span>
                                              {med.packing_spec && (
                                                <span className="text-[11px] text-slate-400 ml-1">
                                                  ({med.packing_spec})
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-2">
                                              Tồn: {med.stock_quantity}
                                            </span>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* Normal Display */
                                  <div className="space-y-1">
                                    {item.isCreateNew ? (
                                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                                        <HiOutlinePlusCircle className="w-4 h-4 shrink-0" />
                                        <span>Tạo mới: {item.rawRow.name}</span>
                                      </div>
                                    ) : item.selectedMedicine ? (
                                      <div className="flex items-center justify-between gap-2">
                                        <div>
                                          <div className="font-bold text-slate-900 dark:text-slate-100">
                                            {item.selectedMedicine.name}
                                          </div>
                                          {item.selectedMedicine.packing_spec && (
                                            <div className="text-[11px] text-slate-400">
                                              {item.selectedMedicine.packing_spec}
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveSearchRowId(item.id);
                                            setSearchQuery('');
                                          }}
                                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0 ml-1"
                                          title="Đổi thuốc khác trong kho"
                                        >
                                          Đổi thuốc
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-red-500 dark:text-red-400 italic text-xs">
                                          Chưa khớp với thuốc nào trong kho
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveSearchRowId(item.id);
                                            setSearchQuery('');
                                          }}
                                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0"
                                        >
                                          Chọn thuốc
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Current Physical Stock */}
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {currentStock !== null ? currentStock : '-'}
                              </td>

                              {/* Additive Quantity */}
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                +{quantity}
                              </td>

                              {/* Projected Resulting Stock */}
                              <td className="px-4 py-3.5 text-right font-mono font-bold whitespace-nowrap">
                                {resultingStock !== null ? (
                                  <span 
                                    className="text-slate-900 dark:text-slate-100"
                                    title={`${currentStock} + ${quantity} = ${resultingStock}`}
                                  >
                                    ={resultingStock}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>

                              {/* Status Badge */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                {item.isCreateNew ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    <span>🔵</span> Tạo mới
                                  </span>
                                ) : item.confidenceStatus === 'CONFIDENT' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    <span>🟢</span> Khớp chính xác
                                  </span>
                                ) : item.confidenceStatus === 'SUGGESTED' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    <span>🟡</span> Cần kiểm tra
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    <span>🔴</span> Chưa khớp
                                  </span>
                                )}
                              </td>

                              {/* Action Options */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    aria-label={`Tạo thuốc mới cho ${item.rawRow.name}`}
                                    checked={item.isCreateNew}
                                    onChange={(e) => handleToggleCreateNew(item.id, e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                                  />
                                  <span>Tạo thuốc mới</span>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Commit Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {items.length > 0 && (
                  <span>
                    Sẵn sàng xử lý{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {items.filter((it) => it.selectedMedicineId !== null || it.isCreateNew).length}
                    </strong>{' '}
                    / {items.length} mặt hàng
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isSubmitting || items.every((it) => it.selectedMedicineId === null && !it.isCreateNew)}
                    className="px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                        <span>Đang cập nhật kho...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Xác nhận nhập kho</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

