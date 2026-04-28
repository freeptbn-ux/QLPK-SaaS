'use client';

import React, { useState, useEffect } from 'react';
import { HiOutlineCalculator, HiOutlineBeaker } from 'react-icons/hi2';
import { getDrugPresets } from '@/actions/settings';
import { cn } from '@/lib/utils/cn';

interface DrugPreset {
  name: string;
  mg: number;
  ml: number;
  dose: number;
}

interface DoseCalculatorProps {
  initialWeight?: string | number;
  initialTimesPerDay?: number;
  isEmbedded?: boolean;
}

export default function DoseCalculator({ 
  initialWeight, 
  initialTimesPerDay = 2,
  isEmbedded = false
}: DoseCalculatorProps) {
  const [presets, setPresets] = useState<DrugPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  const [mg, setMg] = useState<string>('');
  const [ml, setMl] = useState<string>('');
  const [dosePerKg, setDosePerKg] = useState<string>('');
  const [weight, setWeight] = useState<string>(initialWeight?.toString() || '');
  const [timesPerDay, setTimesPerDay] = useState<number>(initialTimesPerDay);
  
  const [result, setResult] = useState<{ mlPerTime: string; totalMl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrugPresets().then(setPresets);
  }, []);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setMg(preset.mg.toString());
      setMl(preset.ml.toString());
      setDosePerKg(preset.dose.toString());
    }
  };

  const calculateDose = () => {
    setError(null);
    setResult(null);

    const nMg = parseFloat(mg);
    const nMl = parseFloat(ml);
    const nDose = parseFloat(dosePerKg);
    const nWeight = parseFloat(weight);

    if (isNaN(nMg) || isNaN(nMl) || isNaN(nDose) || isNaN(nWeight) || nMg <= 0 || nMl <= 0 || nDose <= 0 || nWeight <= 0) {
      setError('Vui lòng nhập đầy đủ các thông số hợp lệ (số dương)');
      return;
    }

    // Công thức: total_ml = (dose_per_kg * weight * ml) / mg
    const totalMl = (nDose * nWeight * nMl) / nMg;
    const mlPerTime = totalMl / timesPerDay;

    setResult({
      mlPerTime: mlPerTime.toFixed(2),
      totalMl: totalMl.toFixed(2)
    });
  };

  return (
    <div className={cn("max-w-3xl mx-auto overflow-hidden", !isEmbedded && "card")}>
      {!isEmbedded && (
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-primary-50/30 dark:bg-primary-900/10">
          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-3">
            <HiOutlineCalculator className="w-6 h-6" /> 
            Công cụ tính liều
          </h3>
        </div>
      )}

      <div className={cn("space-y-8", isEmbedded ? "p-4" : "p-8")}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Chọn từ danh mục thuốc mẫu
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="input-field bg-slate-50/50 dark:bg-slate-800/50"
          >
            <option value="">-- Tự nhập thông số --</option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HiOutlineBeaker className="w-4 h-4 text-blue-500" />
                Hàm lượng & Thể tích
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hàm lượng (mg)</span>
                  <input
                    type="number"
                    value={mg}
                    onChange={(e) => setMg(e.target.value)}
                    className="input-field py-2.5"
                    placeholder="mg"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Thể tích (ml)</span>
                  <input
                    type="number"
                    value={ml}
                    onChange={(e) => setMl(e.target.value)}
                    className="input-field py-2.5"
                    placeholder="ml"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HiOutlineCalculator className="w-4 h-4 text-emerald-500" />
                Thông số bệnh nhi
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Liều (mg/kg)</span>
                  <input
                    type="number"
                    value={dosePerKg}
                    onChange={(e) => setDosePerKg(e.target.value)}
                    className="input-field py-2.5"
                    placeholder="mg/kg"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cân nặng (kg)</span>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-field py-2.5"
                    placeholder="kg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tần suất sử dụng</h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                {[1, 2, 3, 4].map((t) => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="timesPerDay"
                        value={t}
                        checked={timesPerDay === t}
                        onChange={(e) => setTimesPerDay(parseInt(e.target.value))}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        timesPerDay === t 
                          ? "border-primary-600 bg-primary-600" 
                          : "border-gray-300 dark:border-gray-600 bg-transparent group-hover:border-primary-400"
                      )}>
                        {timesPerDay === t && (
                          <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      timesPerDay === t ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {t} lần / ngày
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={calculateDose}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
            >
              <HiOutlineCalculator className="w-5 h-5" />
              TÍNH KẾT QUẢ
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-primary-600 to-blue-700 text-white shadow-2xl shadow-primary-500/30 text-center space-y-4">
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                KẾT QUẢ TÍNH TOÁN
              </span>
              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className="text-5xl font-black tracking-tight">{result.mlPerTime}</span>
                <span className="text-xl font-medium opacity-80">ml / lần</span>
              </div>
              <div className="w-16 h-1 bg-white/20 mx-auto my-4 rounded-full" />
              <p className="text-lg font-medium opacity-90">
                Tổng liều: <span className="font-black underline decoration-white/30 decoration-2 underline-offset-4">{result.totalMl} ml</span> / ngày
              </p>
            </div>
            {/* Background Decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
          </div>
        )}
      </div>
    </div>
  );
}
