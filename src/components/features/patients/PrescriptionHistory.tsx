'use client';

import React, { useState } from 'react';
import { 
  HiOutlineChevronDown, 
  HiOutlinePlus, 
  HiOutlinePrinter, 
  HiOutlineBuildingOffice2,
  HiOutlineQueueList,
  HiOutlineXMark,
  HiOutlineTrash
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { Medicine, PrescriptionWithDetails } from '@/types/database';
import dayjs from 'dayjs';
import Link from 'next/link';
import MedicineAutocomplete from '../prescriptions/MedicineAutocomplete';
import { PrescriptionItem } from '@/types/forms';
import { appendToPrescription, deletePrescription } from '@/actions/prescriptions';
import MedicineUsageDialog from './MedicineUsageDialog';
import { cn } from '@/lib/utils/cn';
import { getPatientPrescriptionsPaginated } from '@/actions/patients';
import { HiOutlineArrowPath } from 'react-icons/hi2';

interface PrescriptionHistoryProps {
  patientId: number;
  patientName: string;
  prescriptions: PrescriptionWithDetails[];
  totalCount?: number;
}

export default function PrescriptionHistory({ patientId, patientName, prescriptions: initialPrescriptions, totalCount = 0 }: PrescriptionHistoryProps) {
  const [appendDialogOpen, setAppendDialogOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [itemsToAppend, setItemsToAppend] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<PrescriptionWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>(initialPrescriptions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalCount > initialPrescriptions.length);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getPatientPrescriptionsPaginated(patientId, nextPage, 10);
      
      setPrescriptions(prev => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more prescriptions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const isToday = (date: string) => dayjs(date).isSame(dayjs(), 'day');

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenAppend = (prescriptionId: number) => {
    setSelectedPrescriptionId(prescriptionId);
    setItemsToAppend([]);
    setAppendDialogOpen(true);
  };

  const handleAddMedicine = (medicine: Medicine | null) => {
    if (!medicine) return;
    if (itemsToAppend.some(i => i.medicine_id === medicine.id)) return;

    setItemsToAppend([...itemsToAppend, {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      packing_spec: medicine.packing_spec || '',
      quantity: 1,
      unit_price: medicine.price
    }]);
  };

  const handleRemoveAppendItem = (id: number) => {
    setItemsToAppend(itemsToAppend.filter(i => i.medicine_id !== id));
  };

  const handleUpdateAppendItem = (id: number, qty: number) => {
    setItemsToAppend(itemsToAppend.map(i => i.medicine_id === id ? { ...i, quantity: qty } : i));
  };

  const handleAppendSubmit = async () => {
    if (!selectedPrescriptionId || itemsToAppend.length === 0) return;

    setLoading(true);
    try {
      const result = await appendToPrescription(selectedPrescriptionId, itemsToAppend, patientId);
      if (result.success) {
        setAppendDialogOpen(false);
      } else {
        alert(result.error);
      }
    } catch {
      alert('Lỗi khi thêm thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deletePrescription(prescriptionToDelete.id, patientId);
      if (result.success) {
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionToDelete.id));
        setIsDeleteDialogOpen(false);
        setPrescriptionToDelete(null);
      } else {
        alert(result.error || 'Lỗi khi xóa đơn thuốc');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Đã xảy ra lỗi khi kết nối với máy chủ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="py-12 px-6 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-600">
          <HiOutlineBuildingOffice2 className="w-16 h-16" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có lịch sử đơn thuốc</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Bệnh nhân này chưa có lượt khám nào.</p>
        <Link
          href={`/patients/${patientId}/prescribe`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Kê đơn đầu tiên
        </Link>
      </div>
    );
  }

  const sortedPrescriptions = [...prescriptions].sort((a, b) => 
    dayjs(b.prescription_date).unix() - dayjs(a.prescription_date).unix()
  );

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Lịch sử khám bệnh ({totalCount || prescriptions.length} lần)
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setHistoryDialogOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            <HiOutlineQueueList className="w-5 h-5" />
            Lịch sử dùng thuốc
          </button>
          <Link
            href={`/patients/${patientId}/prescribe`}
            className="flex-1 sm:flex-none btn-primary inline-flex items-center justify-center gap-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Kê đơn mới
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {sortedPrescriptions.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <div key={p.id} className="card overflow-hidden">
              <button
                onClick={() => toggleExpand(p.id)}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="min-w-[100px]">
                  <p className="text-sm font-bold text-primary-600">
                    {dayjs(p.prescription_date).format('DD/MM/YYYY')}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">#{p.id}</p>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {p.diagnosis || 'Không có chẩn đoán'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isToday(p.prescription_date) && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                      Hôm nay
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-100 dark:border-primary-800 rounded-md">
                    {p.total_amount.toLocaleString('vi-VN')} đ
                  </span>
                  <HiOutlineChevronDown className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-6 pt-2 border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Chi tiết thuốc</h4>
                       
                       <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-slate-900 mb-4 shadow-sm">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-semibold">Tên thuốc</th>
                              <th className="px-4 py-2.5 text-right font-semibold">SL</th>
                              <th className="px-4 py-2.5 text-right font-semibold">Đơn giá</th>
                              <th className="px-4 py-2.5 text-right font-semibold">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {p.prescription_details?.map((detail) => (
                              <tr key={detail.id}>
                                <td className="px-4 py-2.5">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{detail.medicines?.name}</div>
                                  <div className="text-xs text-gray-500">{detail.medicines?.packing_spec}</div>
                                </td>
                                <td className="px-4 py-2.5 text-right font-medium">{detail.quantity}</td>
                                <td className="px-4 py-2.5 text-right text-gray-500">{(detail.unit_price || 0).toLocaleString('vi-VN')}</td>
                                <td className="px-4 py-2.5 text-right font-semibold">
                                  {(detail.quantity * (detail.unit_price || 0)).toLocaleString('vi-VN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Tiền thuốc:</td>
                              <td className="px-4 py-2 text-right font-bold">{(p.total_amount - (p.consultation_fee || 0)).toLocaleString('vi-VN')} đ</td>
                            </tr>
                            {p.consultation_fee > 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Phí khám:</td>
                                <td className="px-4 py-2 text-right text-gray-500">{p.consultation_fee.toLocaleString('vi-VN')} đ</td>
                              </tr>
                            )}
                            <tr className="border-t border-gray-200 dark:border-gray-700">
                              <td colSpan={3} className="px-4 py-3 text-right font-bold text-primary-600">Tổng cộng:</td>
                              <td className="px-4 py-3 text-right font-bold text-primary-600 text-lg">{p.total_amount.toLocaleString('vi-VN')} đ</td>
                            </tr>
                          </tfoot>
                        </table>
                       </div>

                       <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-bold text-gray-900 dark:text-white mr-2">Ghi chú:</span>
                            {p.notes || 'Không có ghi chú'}
                          </p>
                       </div>

                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setPrescriptionToDelete(p);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Xóa đơn
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95">
                            <HiOutlinePrinter className="w-4 h-4" />
                            In đơn thuốc
                          </button>
                          {isToday(p.prescription_date) && (
                            <button 
                              onClick={() => handleOpenAppend(p.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 dark:border-primary-900/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all active:scale-95"
                            >
                              <HiOutlinePlus className="w-4 h-4" />
                              Thêm thuốc
                            </button>
                          )}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
            ) : (
              <HiOutlineChevronDown className="w-5 h-5" />
            )}
            Tải thêm đơn thuốc cũ
          </button>
        </div>
      )}

      {/* Append Dialog */}
      <AnimatePresence>
        {appendDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppendDialogOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thêm thuốc vào đơn #{selectedPrescriptionId}</h3>
                <button 
                  onClick={() => setAppendDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <HiOutlineXMark className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chọn thuốc muốn thêm:</label>
                  <MedicineAutocomplete onSelect={handleAddMedicine} />
                </div>

                {itemsToAppend.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Thuốc</th>
                          <th className="px-4 py-2 text-right font-semibold w-24">SL</th>
                          <th className="px-4 py-2 text-right font-semibold w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {itemsToAppend.map((item) => (
                          <tr key={item.medicine_id}>
                            <td className="px-4 py-2 font-medium">{item.medicine_name}</td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                min="1"
                                onChange={(e) => handleUpdateAppendItem(item.medicine_id, parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 text-right bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button 
                                onClick={() => handleRemoveAppendItem(item.medicine_id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <HiOutlineTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setAppendDialogOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAppendSubmit}
                  disabled={itemsToAppend.length === 0 || loading}
                  className="btn-primary min-w-[100px] flex items-center justify-center"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thêm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && prescriptionToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteDialogOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                  <HiOutlineTrash className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Xác nhận xóa đơn thuốc
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Bạn có chắc chắn muốn xóa đơn thuốc ngày <span className="font-bold text-gray-900 dark:text-white">{dayjs(prescriptionToDelete.prescription_date).format('DD/MM/YYYY')}</span> không? 
                  <br />
                  <span className="text-red-500 text-sm mt-2 block font-medium">Lưu ý: Các dữ liệu thuộc đơn này sẽ bị mất vĩnh viễn.</span>
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    'Xác nhận xóa'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MedicineUsageDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}
