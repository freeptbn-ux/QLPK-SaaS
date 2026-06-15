'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCheck, HiOutlineArrowLeft, HiOutlineCalculator, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import MedicineAutocomplete from './MedicineAutocomplete';
import DoseCalculator from '../dose-calculator/DoseCalculator';
import PrescriptionItemRow from './PrescriptionItemRow';
import { PrescriptionItem, CreatePrescriptionData } from '@/types/forms';
import { Patient, Medicine } from '@/types/database';
import { createPrescription } from '@/actions/prescriptions';
import { formatAge } from '@/lib/utils/age';
import CountUp from '@/components/ui/CountUp';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';
import SpeechBubble from '@/components/ui/SpeechBubble';
import { useMedicineDosage, MedicineDosageData } from '@/hooks/useMedicineDosage';
import { formatDosageText } from '@/lib/utils/formatDosageText';

// Helper to highlight age group headings (e.g., "- Trẻ em dưới 3 tuổi:", "- Người lớn:")
const formatHighlightedDosage = (text: string) => {
  if (!text) return '';
  // Escape HTML entities to avoid XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Highlight lines starting with "-" and ending with ":"
  // Use multiline flag (m) to ensure ^ matches the start of each line
  const highlighted = escaped.replace(/^(\s*-\s*[^:\n]*:)/gm, '<span class="font-bold text-slate-900 dark:text-white">$1</span>');
  return highlighted;
};


const PROMPT_TEMPLATE = {
  role: "Chuyên gia tra cứu dược lâm sàng và hướng dẫn sử dụng thuốc",
  objective: "Tra cứu liều dùng, cách dùng và thời điểm sử dụng của một hoặc nhiều thuốc trong cùng một lần yêu cầu.",
  input_format: {
    description: "Danh sách thuốc phải được truyền trong field 'name'. AI chỉ tra cứu đúng các thuốc nằm trong field này.",
    name: {} as Record<string, string>
  },
  rules: [
    "Chỉ tra cứu các thuốc xuất hiện trong field 'name'.",
    "Nếu chỉ có 1 thuốc thì chỉ tra cứu 1 thuốc.",
    "Nếu có nhiều thuốc thì tra cứu toàn bộ.",
    "Không tự thêm thuốc ngoài danh sách người dùng cung cấp.",
    "Nếu tên thuốc mơ hồ hoặc có nhiều hoạt chất/trade name khác nhau thì phải nêu rõ.",
    "Ưu tiên nguồn chính thống như FDA, EMA, BNF, Micromedex, guideline hoặc tờ hướng dẫn sử dụng.",
    "Nếu thuốc có nhiều chỉ định thì ghi liều dùng phổ biến nhất.",
    "Luôn ghi rõ:",
    "  - Uống trước ăn hay sau ăn",
    "  - Uống lúc đói hay cùng thức ăn",
    "  - Có cần uống sáng/tối/trước ngủ không",
    "Nếu không tìm được dữ liệu đáng tin cậy thì phải ghi rõ là chưa đủ dữ liệu.",
    "Không tự bịa thông tin."
  ],
  output_requirements: [
    "Output phải trả về dưới dạng bảng text.",
    "Không dùng markdown.",
    "Canh cột rõ ràng.",
    "Mỗi thuốc là một dòng riêng.",
    "Format phải đồng nhất và dễ đọc."
  ],
  table_columns: [
    "Tên thuốc",
    "Liều dùng thường gặp",
    "Cách uống",
    "Thời điểm uống"
  ]
};

interface PrescriptionFormProps {
  patient: Patient;
  consultationFee: number;
  presets: any[]; // Ideally use DrugPreset[] if shared
}

export default function PrescriptionForm({ patient, consultationFee, presets }: PrescriptionFormProps) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [weight, setWeight] = useState(patient.weight || '');
  const [weightError, setWeightError] = useState<string | null>(null);
  const [activeDosageLookup, setActiveDosageLookup] = useState<{
    medicineName: string;
    anchorEl: HTMLElement;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const dosageCacheRef = useRef<Map<string, MedicineDosageData>>(new Map());

  // Navigation Guard States
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);
  const bypassGuardRef = useRef(false);

  // Determine if the form is dirty
  const isDirty = useMemo(() => {
    return diagnosis.trim() !== '' || items.length > 0 || notes.trim() !== '';
  }, [diagnosis, items, notes]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmSaveOpen) {
        setConfirmSaveOpen(false);
        setPendingNavigationUrl(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [confirmSaveOpen]);

  // Unload guard (prompt on browser exit/refresh)
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypassGuardRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Intercept standard anchor tags for client-side transitions
  useEffect(() => {
    if (!isDirty) return;
    const handleAnchorClick = (e: MouseEvent) => {
      if (bypassGuardRef.current) return;

      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (target && target instanceof HTMLAnchorElement) {
        const href = target.getAttribute('href');
        if (
          href &&
          !href.startsWith('#') &&
          !href.startsWith('javascript:') &&
          target.target !== '_blank'
        ) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigationUrl(href);
          setConfirmSaveOpen(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [isDirty]);

  // Block browser back/forward buttons (popstate)
  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (bypassGuardRef.current) return;
      window.history.pushState(null, '', window.location.href);
      setPendingNavigationUrl(`/patients/${patient.id}`);
      setConfirmSaveOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, patient.id]);

  const handleCopyPrompt = useCallback(async () => {
    if (items.length === 0) return;

    const names: Record<string, string> = {};
    items.forEach((item, index) => {
      names[`name ${index + 1}`] = item.medicine_name;
    });

    const promptObj = {
      ...PROMPT_TEMPLATE,
      input_format: {
        ...PROMPT_TEMPLATE.input_format,
        name: names
      }
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(promptObj, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      setError('Không thể copy vào clipboard. Vui lòng thử lại.');
      setTimeout(() => setError(null), 3000);
    }
  }, [items]);

  const { data: dosageData, isLoading: isDosageLoading, error: dosageError } = useMedicineDosage({
    medicineName: activeDosageLookup?.medicineName || null,
    cache: dosageCacheRef,
  });

  const validateWeight = (value: string): string | null => {
    if (!value) return 'Vui lòng nhập cân nặng';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Cân nặng phải là số';
    if (num <= 0) return 'Cân nặng phải lớn hơn 0';
    if (num > 500) return 'Cân nặng không hợp lệ';
    return null;
  };

  const handleAddMedicine = useCallback((medicine: Medicine | null) => {
    if (!medicine) return;

    // Check if already added
    if (items.some((item) => item.medicine_id === medicine.id)) {
      setError('Thuốc này đã có trong đơn');
      return;
    }

    const newItem: PrescriptionItem = {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      packing_spec: medicine.packing_spec || '',
      quantity: 1,
      unit_price: medicine.price,
    };

    setItems(prev => [...prev, newItem]);
    setError(null);
  }, [items]);

  const handleUpdateItem = useCallback((index: number, updates: Partial<PrescriptionItem>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems(prev => {
      const itemToRemove = prev[index];
      if (activeDosageLookup?.medicineName === itemToRemove?.medicine_name) {
        setActiveDosageLookup(null);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [activeDosageLookup]);

  const handleMedicineClick = useCallback((medicineName: string, anchorEl: HTMLElement) => {
    setActiveDosageLookup({ medicineName, anchorEl });
  }, []);

  const handleCloseDosage = useCallback(() => {
    setActiveDosageLookup(null);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price), 0);
  }, [items]);

  const total = subtotal + consultationFee;

  const handleSaveAndSubmit = async (targetUrl?: string) => {
    if (!diagnosis) {
      setError('Vui lòng nhập chẩn đoán');
      return false;
    }
    if (items.length === 0) {
      setError('Vui lòng chọn ít nhất một loại thuốc');
      return false;
    }

    const wErr = validateWeight(weight);
    if (wErr) {
      setWeightError(wErr);
      setError('Vui lòng kiểm tra lại thông tin cân nặng');
      return false;
    }

    setLoading(true);
    setError(null);

    const data: CreatePrescriptionData = {
      patient_id: patient.id,
      diagnosis,
      items,
      notes,
      consultation_fee: consultationFee,
      weight,
    };

    try {
      const result = await createPrescription(data);
      if (result.success) {
        bypassGuardRef.current = true;
        router.push(targetUrl || `/patients/${patient.id}`);
        router.refresh();
        return true;
      } else {
        setError(result.error || 'Có lỗi xảy ra khi lưu đơn thuốc');
        return false;
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveAndSubmit();
  };

  const handleBack = () => {
    if (isDirty) {
      setPendingNavigationUrl(`/patients/${patient.id}`);
      setConfirmSaveOpen(true);
    } else {
      router.back();
    }
  };

  const handleDiscard = () => {
    setConfirmSaveOpen(false);
    bypassGuardRef.current = true;
    if (pendingNavigationUrl) {
      router.push(pendingNavigationUrl);
    } else {
      router.push(`/patients/${patient.id}`);
    }
  };

  const handleConfirmSave = async () => {
    setConfirmSaveOpen(false);
    await handleSaveAndSubmit(pendingNavigationUrl || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Thông tin đơn thuốc
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Chẩn đoán <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Ví dụ: Viêm họng cấp, Sốt siêu vi..."
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Chọn thuốc
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCalculator(!showCalculator)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                      >
                        <HiOutlineCalculator className="w-4 h-4" />
                        {showCalculator ? 'Đóng tính liều' : 'Tính liều nhanh'}
                      </button>
                    </div>
                    
                    {showCalculator && (
                      <div className="p-4 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <DoseCalculator 
                          initialWeight={weight || undefined} 
                          initialTimesPerDay={2} 
                          isEmbedded={true} 
                          presets={presets}
                        />
                      </div>
                    )}

                    <MedicineAutocomplete
                      onSelect={handleAddMedicine}
                      excludeIds={items.map((i) => i.medicine_id)}
                    />
                  </div>

                  <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="px-4 py-3">Tên thuốc</th>
                            <th className="px-4 py-3 min-w-[80px] w-[100px]">SL</th>
                            <th className="px-4 py-3 w-[140px]">Đơn giá</th>
                            <th className="px-4 py-3 text-right">Thành tiền</th>
                            <th className="px-4 py-3 w-[50px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                          {items.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">
                                Chưa có thuốc nào được chọn
                              </td>
                            </tr>
                          ) : (
                            items.map((item, index) => (
                              <PrescriptionItemRow
                                key={item.medicine_id}
                                item={item}
                                index={index}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                                onMedicineClick={handleMedicineClick}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ghi chú thêm
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú về cách dùng, liều lượng..."
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="card">
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Bệnh nhân
                </h3>
                <div className="space-y-1">
                  <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                    {patient.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{patient.gender}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span>{formatAge(patient.dob || '') || 'Không rõ tuổi'}</span>
                  </p>
                  
                  {/* Weight Input - Bắt buộc */}
                  <div className="mt-3 space-y-1.5">
                    <label htmlFor="prescription-weight" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Cân nặng (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="prescription-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="500"
                      required
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        setWeightError(validateWeight(e.target.value));
                      }}
                      onBlur={() => setWeightError(validateWeight(weight))}
                      placeholder="VD: 65"
                      className={cn(
                        "input-field",
                        weightError && "border-red-400 focus:ring-red-400"
                      )}
                      aria-invalid={!!weightError}
                      aria-describedby={weightError ? "weight-error" : undefined}
                    />
                    {weightError && (
                      <p id="weight-error" className="text-xs text-red-500 font-medium">
                        {weightError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden border-0">
              <div className="p-6">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">
                  Thanh toán
                </h3>
                
                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 pb-1">Tổng cộng:</span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                      <CountUp value={total} />
                    </div>
                    <span className="text-xs font-bold text-primary-500/50 uppercase tracking-widest">Việt Nam Đồng</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    disabled={items.length === 0}
                    aria-label="Copy prompt"
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2",
                      copied
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-500/20"
                        : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-slate-500/10",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    {copied ? (
                      <>
                        <HiOutlineCheck className="w-5 h-5" />
                        <span>Đã copy!</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineClipboardDocumentList className="w-5 h-5" />
                        <span>Copy prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                      "bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-700 hover:to-blue-600",
                      "shadow-primary-500/25 hover:shadow-primary-500/40",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    {loading ? (
                      <BallLoader size="sm" text="" className="!gap-0" />
                    ) : (
                      <HiOutlineCheck className="w-5 h-5" />
                    )}
                    Lưu đơn thuốc
                  </button>

                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeDosageLookup && (
        <SpeechBubble
          anchorEl={activeDosageLookup.anchorEl}
          isOpen={!!activeDosageLookup}
          onClose={handleCloseDosage}
          title={`Liều dùng: ${activeDosageLookup.medicineName}`}
          loading={isDosageLoading}
          error={!!dosageError}
          onRetry={() => handleMedicineClick(activeDosageLookup.medicineName, activeDosageLookup.anchorEl)}
        >
          {dosageData ? (
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {/* 1. Trẻ em - Ưu tiên hàng đầu */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Trẻ em
                </p>
                  <div className="text-sm text-slate-700 dark:text-slate-200 bg-primary-50/30 dark:bg-primary-900/10 p-3 rounded-xl border border-primary-100/50 dark:border-primary-900/20 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatHighlightedDosage(dosageData.children_dosage) }} />
              </div>

              {/* 2. Người lớn */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pl-1.5">
                  Người lớn
                </p>
                <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatHighlightedDosage(dosageData.adult_dosage) }} />
              </div>

              {/* 3. Hướng dẫn sử dụng */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider pl-1.5">Hướng dẫn sử dụng</p>
                <div className="text-sm text-slate-700 dark:text-slate-200 bg-blue-50/30 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20 whitespace-pre-wrap">
                  {dosageData.usage_instructions}
                </div>
              </div>

              {/* 4. Mô tả & Thành phần - Xuống cuối */}
              <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Mô tả & Thành phần</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">{dosageData.description}</p>
              </div>
              
              <p className="text-[10px] text-gray-400 italic text-right mt-2 pb-2">
                * Thông tin tra cứu tự động từ AI, chỉ mang tính chất tham khảo
              </p>
            </div>
          ) : null}
        </SpeechBubble>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmSaveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setConfirmSaveOpen(false);
                setPendingNavigationUrl(null);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Thay đổi chưa được lưu
              </h3>
              <div className="mt-3">
                <p className="text-slate-600 dark:text-slate-400">
                  Bạn có thay đổi chưa lưu trên đơn thuốc này. Bạn có muốn lưu lại trước khi rời đi không?
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmSaveOpen(false);
                    setPendingNavigationUrl(null);
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 rounded-xl transition-all active:scale-[0.95]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-[0.95] shadow-md shadow-red-500/10"
                >
                  Không lưu đơn
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all active:scale-[0.95] shadow-md shadow-emerald-500/10"
                >
                  Lưu đơn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
