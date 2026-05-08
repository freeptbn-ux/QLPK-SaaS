import React from 'react';
import Link from 'next/link';
import { getPatientBasicInfo } from '@/actions/patients';
import { getConsultationFee } from '@/actions/prescriptions';
import { getDrugPresets } from '@/actions/settings';
import PrescriptionForm from '@/components/features/prescriptions/PrescriptionForm';
import { notFound } from 'next/navigation';
import { HiChevronRight } from 'react-icons/hi2';

interface PrescribePageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescribePage({ params }: PrescribePageProps) {
  const { id } = await params;
  const patientId = parseInt(id);
  
  if (isNaN(patientId)) {
    notFound();
  }

  const [patient, consultationFee, presets] = await Promise.all([
    getPatientBasicInfo(patientId),
    getConsultationFee(),
    getDrugPresets()
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm font-medium">
            <li>
              <Link href="/patients" className="text-slate-500 hover:text-blue-600 transition-colors">
                Bệnh nhân
              </Link>
            </li>
            <HiChevronRight className="w-4 h-4 text-slate-400" />
            <li>
              <Link href={`/patients/${patientId}`} className="text-slate-500 hover:text-blue-600 transition-colors">
                {patient.name}
              </Link>
            </li>
            <HiChevronRight className="w-4 h-4 text-slate-400" />
            <li className="text-slate-900 dark:text-white font-bold">
              Kê đơn thuốc
            </li>
          </ol>
        </nav>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kê đơn thuốc mới
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Ghi nhận thông tin khám bệnh và đơn thuốc cho bệnh nhân {patient.name}
        </p>
      </div>

      <PrescriptionForm 
        patient={patient} 
        consultationFee={consultationFee} 
        presets={presets} 
      />
    </div>
  );
}
