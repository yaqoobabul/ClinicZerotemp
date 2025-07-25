import { DentalPrescriptionGenerator } from '@/components/app/DentalPrescriptionGenerator';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DentalPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
          <CardTitle>Dental OPD Visit Entry</CardTitle>
          <CardDescription>
            Enter patient visit details to generate a printable OPD summary for dental consultations.
          </CardDescription>
        </CardHeader>
        <DentalPrescriptionGenerator />
    </div>
  );
}
