'use client';

import React, { useState, useTransition } from 'react';
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineEllipsisVertical
} from 'react-icons/hi2';
import { Patient } from '@/types/database';
import { deletePatient } from '@/actions/patients';
import PatientSearch from './PatientSearch';
import PatientFormDialog from './PatientFormDialog';
import MergePatientDialog from './MergePatientDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { formatAge } from '@/lib/utils/age';
import { formatLastVisit, formatDob } from '@/lib/utils/date';
import { useRouter, useSearchParams } from 'next/navigation';

interface PatientListClientProps {
  initialData: Patient[];
  totalCount: number;
  currentPage: number;
  currentSize: number;
  searchQuery: string;
}

export default function PatientListClient({
  initialData,
  totalCount,
  currentPage,
  currentSize,
  searchQuery,
}: PatientListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const refreshData = () => {
    router.refresh();
  };

  const handleChangePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage + 1)); // UI uses 0-indexed internally but URL uses 1-indexed
    startTransition(() => {
      router.replace(`/patients?${params.toString()}`, { scroll: false });
    });
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', e.target.value);
    params.set('page', '1');
    router.push(`/patients?${params.toString()}`, { scroll: false });
  };

  const handleSearch = React.useCallback((term: string) => {
    const currentQ = searchParams.get('q') || '';
    if (term === currentQ) return; // Prevent unnecessary route pushes to break the loop

    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    startTransition(() => {
      router.replace(`/patients?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, router]);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setFormOpen(true);
  };

  const handleOpenMerge = () => {
    setMergeOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatient(patientToDelete.id);
        refreshData();
      } catch (error) {
        console.error('Failed to delete patient:', error);
      } finally {
        setDeleteConfirmOpen(false);
        setPatientToDelete(null);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / currentSize);
  const page = currentPage - 1; // Convert 1-indexed to 0-indexed for UI logic
  const rowsPerPage = currentSize;
  const patients = initialData;

  return (
    <div className="space-y-4">
      {/* Search and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-grow">
          <PatientSearch 
            onSearch={handleSearch} 
            initialValue={searchQuery} 
            isLoading={isPending}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenMerge}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
            title="Dọn dẹp hồ sơ trùng lặp"
          >
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
            <span className="hidden sm:inline">Dọn trùng</span>
          </button>
          <button
            onClick={handleAddPatient}
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Thêm bệnh nhân
          </button>
        </div>
      </div>

      {/* Table / Mobile Cards */}
      <div className="card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 font-bold tracking-tight w-16">STT</th>
                <th className="px-6 py-5 font-bold tracking-tight">Họ và tên</th>
                <th className="px-6 py-5 font-bold tracking-tight">Ngày sinh</th>
                <th className="px-6 py-5 font-bold tracking-tight">SĐT</th>
                <th className="px-6 py-5 font-bold tracking-tight">Khám gần nhất</th>
                <th className="px-6 py-5 font-bold tracking-tight text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <EmptyState 
                      title="Không tìm thấy bệnh nhân nào" 
                      description="Thử thay đổi từ khóa tìm kiếm hoặc thêm mới bệnh nhân để bắt đầu quản lý hồ sơ" 
                    />
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <td className="px-6 py-5 text-slate-400 font-medium">
                      {page * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 transition-colors">
                        <Link 
                          href={`/patients/${patient.id}`}
                          className="hover:text-primary-600 hover:underline transition-colors"
                        >
                          {patient.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{formatDob(patient.dob)}</div>
                      {patient.dob && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatAge(patient.dob)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-700 dark:text-slate-300">{patient.phone || 'N/A'}</td>
                    <td className="px-6 py-5">
                      <div className={`text-sm font-medium ${
                        patient.last_visit_date 
                          ? 'text-slate-700 dark:text-slate-300' 
                          : 'text-slate-400 dark:text-slate-600 italic'
                      }`}>
                        {formatLastVisit(patient.last_visit_date)}
                      </div>
                      {patient.last_visit_date && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(patient.last_visit_date).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                          title="Xem chi tiết"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                        
                        <button
                          onClick={() => handleDeleteClick(patient)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
          {patients.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState title="Không tìm thấy bệnh nhân nào" />
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      <Link 
                        href={`/patients/${patient.id}`}
                        className="hover:text-primary-600 hover:underline transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {patient.dob ? `${formatDob(patient.dob)} • ${formatAge(patient.dob)}` : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      🩺 {formatLastVisit(patient.last_visit_date)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                    {patient.phone || 'No phone'}
                  </span>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                   <Link
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    <HiOutlineEye className="w-5 h-5" />
                    Chi tiết
                  </Link>
                  <button
                    onClick={() => handleEditPatient(patient)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(patient)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {patients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="text-sm text-slate-500 order-2 sm:order-1">
            Hiển thị <span className="font-medium text-slate-900 dark:text-slate-100">{page * rowsPerPage + 1}</span> đến <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> trong <span className="font-medium text-slate-900 dark:text-slate-100">{totalCount}</span> bệnh nhân
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Số hàng:</span>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                {[25, 50, 100].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-3 text-sm font-medium">
                Trang {page + 1} / {totalPages || 1}
              </div>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={selectedPatient}
        onSuccess={refreshData}
      />

      <MergePatientDialog
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        onSuccess={refreshData}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bệnh nhân "${patientToDelete?.name}"? Hành động này sẽ xóa toàn bộ đơn thuốc liên quan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
