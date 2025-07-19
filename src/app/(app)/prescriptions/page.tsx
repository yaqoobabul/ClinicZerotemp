import { PrescriptionGenerator } from '@/components/app/PrescriptionGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrescriptionsPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
          <CardTitle>OPD Visit Entry</CardTitle>
          <CardDescription>
            Enter patient visit details to generate a printable OPD summary.
          </CardDescription>
        </CardHeader>
        <PrescriptionGenerator />
    </div>
  );
}
