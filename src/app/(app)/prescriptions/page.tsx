
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrescriptionGenerator } from '@/components/app/PrescriptionGenerator';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function PrescriptionsPageContent() {
  const searchParams = useSearchParams();

  const patientProps = {
    patientId: searchParams.get('patientId') || undefined,
    patientName: searchParams.get('patientName') || undefined,
    patientAge: searchParams.get('patientAge') || undefined,
    patientGender: searchParams.get('patientGender') || undefined,
    patientContact: searchParams.get('patientContact') || undefined,
    patientAddress: searchParams.get('patientAddress') || undefined,
    govtId: searchParams.get('govtId') || undefined,
  };

  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
          <CardTitle>General OPD Visit Entry</CardTitle>
          <CardDescription>
            Enter patient visit details to generate a printable OPD summary.
          </CardDescription>
        </CardHeader>
        <PrescriptionGenerator key={searchParams.toString()} {...patientProps} />
    </div>
  );
}


export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrescriptionsPageContent />
    </Suspense>
  )
}
