'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { HiOutlineCheck, HiOutlineArrowLeft, HiOutlineCalculator } from 'react-icons/hi2';
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

  const dosageCacheRef = useRef<Map<string, MedicineDosageData>>(new Map());

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) {
      setError('Vui lòng nhập chẩn đoán');
      return;
    }
    if (items.length === 0) {
      setError('Vui lòng chọn ít nhất một loại thuốc');
      return;
    }

    const wErr = validateWeight(weight);
    if (wErr) {
      setWeightError(wErr);
      setError('Vui lòng kiểm tra lại thông tin cân nặng');
      return;
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
        router.push(`/patients/${patient.id}`);
        router.refresh();
      } else {
        setError(result.error || 'Có lỗi xảy ra khi lưu đơn thuốc');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
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
                    onClick={() => router.back()}
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
            <div className="space-y-4">
              <div className="bg-primary-50/50 dark:bg-primary-900/10 p-3 rounded-xl border border-primary-100/50 dark:border-primary-900/20">
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Mô tả & Thành phần</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{dosageData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người lớn</p>
                  <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {dosageData.adult_dosage}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trẻ em</p>
                  <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {dosageData.children_dosage}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hướng dẫn sử dụng</p>
                <div className="text-sm text-slate-700 dark:text-slate-200 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                  {dosageData.usage_instructions}
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 italic text-right mt-2">
                * Thông tin tra cứu tự động từ AI, chỉ mang tính chất tham khảo
              </p>
            </div>
          ) : null}
        </SpeechBubble>
      )}
    </div>
  );
}
