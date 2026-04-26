'use client';

import React, { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi2';
import { PatientWithPrescriptions } from '@/types/database';
import { useRouter } from 'next/navigation';
import PrescriptionHistory from './PrescriptionHistory';
import PatientFormDialog from './PatientFormDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deletePatient } from '@/actions/patients';
import { formatAge } from '@/lib/utils/age';

interface PatientDetailProps {
  patient: PatientWithPrescriptions; 
}

export default function PatientDetail({ patient }: PatientDetailProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const handleDelete = async () => {
    try {
      await deletePatient(patient.id);
      router.push('/patients');
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const handleUpdateSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/patients')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Quay lại danh sách
      </button>

      <div className="card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Thông tin bệnh nhân
              </h2>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFormOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
              >
                <HiOutlinePencil className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
              >
                <HiOutlineTrash className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Họ và tên</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">{patient.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giới tính</span>
              <p className="text-base text-gray-900 dark:text-gray-100">{patient.gender || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ngày sinh / Tuổi</span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {patient.dob || 'N/A'}
                {patient.dob && formatAge(patient.dob) && (
                  <span className="ml-2 text-primary-600 font-medium">({formatAge(patient.dob)})</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Số điện thoại</span>
              <p className="text-base text-gray-900 dark:text-gray-100">{patient.phone || 'N/A'}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ</span>
              <p className="text-base text-gray-900 dark:text-gray-100">{patient.address || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cân nặng</span>
              <p className="text-base text-gray-900 dark:text-gray-100">{patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chẩn đoán gần nhất</span>
              <p className="text-base text-gray-900 dark:text-gray-100">{patient.diagnosis || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <PrescriptionHistory 
        patientId={patient.id} 
        patientName={patient.name}
        prescriptions={patient.prescriptions || []} 
        totalCount={patient.totalPrescriptions}
      />

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={patient}
        onSuccess={handleUpdateSuccess}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bệnh nhân "${patient.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

    </div>
  );
}
