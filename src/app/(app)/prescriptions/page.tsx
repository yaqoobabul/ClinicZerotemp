
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrescriptionGenerator } from '@/components/app/PrescriptionGenerator';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function PrescriptionsPageContent() {
  const searchParams = useSearchParams();
  // Using searchParams.toString() as a key forces a re-render when the query params change.
  const key = searchParams.toString();

  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
          <CardTitle>General OPD Visit Entry</CardTitle>
          <CardDescription>
            Enter patient visit details to generate a printable OPD summary.
          </CardDescription>
        </CardHeader>
        <PrescriptionGenerator key={key} />
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
