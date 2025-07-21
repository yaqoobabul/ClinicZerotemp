
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DentalPrescriptionGenerator } from '@/components/app/DentalPrescriptionGenerator';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


function DentalPageContent() {
  const searchParams = useSearchParams();
  // Using searchParams.toString() as a key forces a re-render when the query params change.
  const key = searchParams.toString();

  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
          <CardTitle>Dental OPD Visit Entry</CardTitle>
          <CardDescription>
            Enter patient visit details to generate a printable OPD summary for dental consultations.
          </CardDescription>
        </CardHeader>
        <DentalPrescriptionGenerator key={key} />
    </div>
  );
}

export default function DentalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DentalPageContent />
    </Suspense>
  )
}
