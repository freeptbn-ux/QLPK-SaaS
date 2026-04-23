'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Patient } from '@/types/database';
import { getPatientsPaginated, searchPatients, deletePatient } from '@/actions/patients';
import PatientSearch from './PatientSearch';
import PatientFormDialog from './PatientFormDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';
import { formatAge } from '@/lib/utils/age';

export default function PatientList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
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
    fetchPatients();
  }, [fetchPatients]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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

  const renderMobileList = () => (
    <Stack spacing={2}>
      {patients.map((patient) => (
        <Card key={patient.id} variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography variant="h6" component="div">
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.gender} • {formatAge(patient.dob || '') || patient.dob || 'N/A'}
                </Typography>
              </Box>
              <Chip label={patient.phone || 'N/A'} size="small" />
            </Stack>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Chẩn đoán:</strong> {patient.diagnosis || 'Chưa có'}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end', mt: 2 }}
            >
              <IconButton size="small" component={Link} href={`/patients/${patient.id}`}>
                <VisibilityIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleEditPatient(patient)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleDeleteClick(patient)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  const renderDesktopTable = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell width={60}>STT</TableCell>
            <TableCell>Họ và tên</TableCell>
            <TableCell>Ngày sinh</TableCell>
            <TableCell>Giới tính</TableCell>
            <TableCell>SĐT</TableCell>
            <TableCell>Địa chỉ</TableCell>
            <TableCell>Chẩn đoán</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <LoadingSkeleton columns={8} rows={10} />
          ) : patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <EmptyState title="Không tìm thấy bệnh nhân nào" description="Thử thay đổi từ khóa tìm kiếm" />
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient, index) => (
              <TableRow key={patient.id} hover>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {patient.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {patient.dob || 'N/A'}
                  {patient.dob && formatAge(patient.dob || '') && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {formatAge(patient.dob || '')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.address}</TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.diagnosis}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ justifyContent: 'flex-end' }}
                  >
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" component={Link} href={`/patients/${patient.id}`}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" onClick={() => handleEditPatient(patient)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(patient)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <PatientSearch onSearch={handleSearch} />
        </Box>
        <Box>
          <button
            onClick={handleAddPatient}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
            style={{ backgroundColor: theme.palette.primary.main, color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
          >
            Thêm bệnh nhân
          </button>
        </Box>
      </Box>

      {isMobile ? renderMobileList() : renderDesktopTable()}

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
      />

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={selectedPatient}
        onSuccess={fetchPatients}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bệnh nhân "${patientToDelete?.name}"? Hành động này sẽ xóa toàn bộ đơn thuốc liên quan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
}
