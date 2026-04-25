'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineXMark, 
  HiOutlineTrash, 
  HiOutlineUserCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import { getPotentialDuplicates, mergePatients } from '@/actions/patients';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface DuplicateGroup {
  name_normalized: string;
  dob: string;
  phone: string;
  patient_ids: number[];
  patient_names: string[];
  patient_addresses: string[];
}

interface MergePatientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MergePatientDialog({
  open,
  onClose,
  onSuccess,
}: MergePatientDialogProps) {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for selection: groupKey -> masterId
  const [selections, setSelections] = useState<Record<string, number>>({});
  
  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergingGroups, setMergingGroups] = useState<Set<string>>(new Set());

  const getGroupKey = (group: DuplicateGroup) => 
    `${group.name_normalized}_${group.dob}_${group.phone}`;

  const fetchDuplicates = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPotentialDuplicates();
      setGroups(data);
      
      // Default selections: pick the first ID in each group as master
      const defaultSelections: Record<string, number> = {};
      data.forEach((group) => {
        defaultSelections[getGroupKey(group)] = group.patient_ids[0];
      });
      setSelections(defaultSelections);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      showToast('Không thể quét dữ liệu trùng lặp', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDuplicates();
    }
  }, [open, fetchDuplicates]);

  const handleSelectMaster = (groupKey: string, patientId: number) => {
    setSelections(prev => ({
      ...prev,
      [groupKey]: patientId
    }));
  };

  const handleMergeGroup = async (group: DuplicateGroup) => {
    const groupKey = getGroupKey(group);
    const masterId = selections[groupKey];
    const duplicateIds = group.patient_ids.filter(id => id !== masterId);

    if (duplicateIds.length === 0) return;

    setMergingGroups(prev => new Set(prev).add(groupKey));
    try {
      await mergePatients(masterId, duplicateIds);
      showToast(`Đã gộp thành công nhóm bệnh nhân ${group.patient_names[0]}`, 'success');
      
      // Remove group from list
      setGroups(prev => prev.filter(g => getGroupKey(g) !== groupKey));
      onSuccess(); // Refresh parent list
    } catch (error) {
      console.error('Error merging group:', error);
      showToast('Có lỗi xảy ra khi gộp nhóm này', 'error');
    } finally {
      setMergingGroups(prev => {
        const next = new Set(prev);
        next.delete(groupKey);
        return next;
      });
    }
  };

  const handleMergeAll = async () => {
    setConfirmOpen(false);
    setMerging(true);
    
    try {
      let successCount = 0;
      const groupsToMerge = [...groups];
      
      // Perform merge for each group
      for (const group of groupsToMerge) {
        const groupKey = getGroupKey(group);
        const masterId = selections[groupKey];
        const duplicateIds = group.patient_ids.filter(id => id !== masterId);
        
        if (duplicateIds.length > 0) {
          await mergePatients(masterId, duplicateIds);
          successCount++;
        }
      }
      
      showToast(`Đã gộp thành công ${successCount} nhóm bệnh nhân`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error merging patients:', error);
      showToast('Có lỗi xảy ra khi gộp bệnh nhân', 'error');
    } finally {
      setMerging(false);
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div key="merge-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={merging ? undefined : onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dọn dẹp hồ sơ trùng lặp
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phát hiện các bệnh nhân có cùng Họ tên, Ngày sinh và Số điện thoại.
                </p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                disabled={merging}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
              >
                <HiOutlineXMark className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary-600 animate-pulse">
                    <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Đang quét dữ liệu...</span>
                  </div>
                  <div className="space-y-4 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : groups.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
                    <HiOutlineCheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Tuyệt vời!</h4>
                    <p className="text-gray-500">Hệ thống không phát hiện hồ sơ bệnh nhân nào bị trùng lặp.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                    <HiOutlineExclamationTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      <p className="font-semibold">Lưu ý quan trọng:</p>
                      <ul className="list-disc ml-4 mt-1 space-y-1">
                        <li>Lịch sử khám bệnh của các hồ sơ phụ sẽ được chuyển sang hồ sơ Gốc.</li>
                        <li>Các hồ sơ phụ sẽ bị <strong>xóa vĩnh viễn</strong> sau khi gộp.</li>
                        <li>Hành động này <strong>không thể hoàn tác</strong>.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {groups.map((group, gIndex) => (
                      <div 
                        key={gIndex}
                        className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full">
                              Nhóm {gIndex + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {group.patient_ids.length} hồ sơ trùng
                            </span>
                          </div>
                          <button
                            onClick={() => handleMergeGroup(group)}
                            disabled={merging || mergingGroups.has(getGroupKey(group))}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 disabled:opacity-50"
                          >
                            {mergingGroups.has(getGroupKey(group)) ? (
                              <HiOutlineArrowPath className="w-3 h-3 animate-spin" />
                            ) : (
                              <HiOutlineTrash className="w-3 h-3" />
                            )}
                            Gộp nhóm này
                          </button>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                          {group.patient_ids.map((id, pIndex) => {
                            const groupKey = getGroupKey(group);
                            const isMaster = selections[groupKey] === id;
                            return (
                              <div 
                                key={id}
                                className={`p-4 flex items-center justify-between transition-colors ${
                                  isMaster 
                                    ? 'bg-primary-50/30 dark:bg-primary-900/10' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    isMaster 
                                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600' 
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                  }`}>
                                    <HiOutlineUserCircle className="w-7 h-7" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {group.patient_names[pIndex]}
                                      </span>
                                      <span className="text-xs text-gray-500">ID: {id}</span>
                                      {isMaster && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary-600 text-white rounded">
                                          Gốc
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-1">
                                      {group.patient_addresses[pIndex] || 'Không có địa chỉ'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSelectMaster(getGroupKey(group), id)}
                                  disabled={merging || mergingGroups.has(getGroupKey(group))}
                                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    isMaster
                                      ? 'bg-primary-600 text-white cursor-default'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  } disabled:opacity-50`}
                                >
                                  {isMaster ? 'Đang chọn làm Gốc' : 'Chọn làm Gốc'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-500 italic">
                {groups.length > 0 && `Đã chọn ${groups.length} hồ sơ Gốc để giữ lại.`}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={merging}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                {groups.length > 0 && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={merging}
                    className="btn-primary min-w-[120px] flex items-center justify-center gap-2"
                  >
                    {merging ? (
                      <>
                        <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
                        Đang gộp...
                      </>
                    ) : (
                      <>
                        <HiOutlineTrash className="w-5 h-5" />
                        Thực hiện Gộp
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

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận gộp bệnh nhân"
        message="Hành động này sẽ chuyển toàn bộ lịch sử khám bệnh về hồ sơ Gốc và XÓA các hồ sơ trùng lặp khác. Bạn có chắc chắn muốn tiếp tục? Hành động này không thể hoàn tác."
        confirmLabel="Tôi chắc chắn, Gộp ngay"
        cancelLabel="Để sau"
        onConfirm={handleMergeAll}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
