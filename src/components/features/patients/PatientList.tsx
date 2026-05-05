'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus
} from 'react-icons/hi2';
import { Patient } from '@/types/database';
import { getPatientsPaginated, searchPatients, deletePatient } from '@/actions/patients';
import PatientSearch from './PatientSearch';
import PatientFormDialog from './PatientFormDialog';
import MergePatientDialog from './MergePatientDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { LoadingReporter } from '@/components/Loading';
import Link from 'next/link';
import { formatAge } from '@/lib/utils/age';

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (searchTerm) {
        result = await searchPatients(searchTerm, page + 1, rowsPerPage);
      } else {
        result = await getPatientsPaginated(page + 1, rowsPerPage);
      }
      setPatients(result.data);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPatients();
  }, [fetchPatients]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

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
        fetchPatients();
      } catch (error) {
        console.error('Failed to delete patient:', error);
      } finally {
        setDeleteConfirmOpen(false);
        setPatientToDelete(null);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="space-y-4">
      {/* Search and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-grow">
          <PatientSearch onSearch={handleSearch} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenMerge}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
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
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3 w-16">STT</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Ngày sinh</th>
                <th className="px-4 py-3">Giới tính</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Chẩn đoán</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-0 border-none">
                    <LoadingReporter text="Đang tải danh sách bệnh nhân..." />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <EmptyState 
                      title="Không tìm thấy bệnh nhân nào" 
                      description="Thử thay đổi từ khóa tìm kiếm hoặc thêm mới bệnh nhân" 
                    />
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500">
                      {page * rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      <Link 
                        href={`/patients/${patient.id}`}
                        className="hover:text-primary-600 hover:underline transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>{patient.dob || 'N/A'}</div>
                      {patient.dob && (
                        <div className="text-xs text-gray-500">
                          {formatAge(patient.dob)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{patient.gender}</td>
                    <td className="px-4 py-3">{patient.phone || 'N/A'}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]" title={patient.address || ''}>
                      {patient.address || 'N/A'}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[200px]" title={patient.diagnosis || ''}>
                      {patient.diagnosis || 'Chưa có'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(patient)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
             <div className="p-4">
                <LoadingReporter text="Đang tải danh sách..." />
             </div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState title="Không tìm thấy bệnh nhân nào" />
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      <Link 
                        href={`/patients/${patient.id}`}
                        className="hover:text-primary-600 hover:underline transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {patient.gender} • {patient.dob ? formatAge(patient.dob) : 'N/A'}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                    {patient.phone || 'No phone'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  <span className="font-medium">Chẩn đoán:</span> {patient.diagnosis || 'Chưa có'}
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                   <Link
                    href={`/patients/${patient.id}`}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <HiOutlineEye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleEditPatient(patient)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(patient)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && patients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Hiển thị <span className="font-medium text-gray-900 dark:text-gray-100">{page * rowsPerPage + 1}</span> đến <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> trong <span className="font-medium text-gray-900 dark:text-gray-100">{totalCount}</span> bệnh nhân
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Số hàng:</span>
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
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-3 text-sm font-medium">
                Trang {page + 1} / {totalPages || 1}
              </div>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
        onSuccess={fetchPatients}
      />

      <MergePatientDialog
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        onSuccess={fetchPatients}
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
