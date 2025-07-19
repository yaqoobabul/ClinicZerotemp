import { PrescriptionGenerator } from '@/components/app/PrescriptionGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrescriptionsPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Prescription Generator</CardTitle>
          <CardDescription>
            Enter the patient's prescription details in free-text. The AI will structure it for you. You can also use voice-to-text input.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrescriptionGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
