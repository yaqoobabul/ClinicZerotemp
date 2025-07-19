'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generatePrescription, type GeneratePrescriptionOutput } from '@/ai/flows/generate-prescription';
import { Loader2, Mic, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MarkdownTable } from './MarkdownTable';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  speechInput: z.string().min(10, 'Please provide more details for the prescription.'),
});

export function PrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [prescription, setPrescription] = useState<GeneratePrescriptionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      speechInput: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrescription(null);
    try {
      const result = await generatePrescription(values);
      setPrescription(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Prescription',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrint = () => {
    const printableArea = document.getElementById('printable-prescription');
    if (printableArea) {
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow?.document.write('<html><head><title>Prescription</title>');
        // Inject styles
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('');
                } catch (e) {
                    console.log('Access to stylesheet %s is denied. Skipping.', styleSheet.href);
                    return '';
                }
            }).join('');
        printWindow?.document.write(`<style>${styles}</style>`);
        printWindow?.document.write('<style>@media print { .no-print { display: none !important; } }</style>');
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(printableArea.innerHTML);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.focus();
        printWindow?.print();
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="speechInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Doctor's Notes</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="e.g., 'Give Paracetamol 500mg twice a day for 3 days, and Azithromycin 250mg once a day before food for 5 days.'"
                      rows={5}
                      className="pr-12"
                      {...field}
                    />
                    <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Mic className="h-5 w-5" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Prescription
          </Button>
        </form>
      </Form>

      {isLoading && (
         <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is thinking... please wait.</p>
            </div>
         </div>
      )}

      {prescription && (
        <Card className="mt-6" id="printable-prescription">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Generated OPD Summary</CardTitle>
                <div className="flex gap-2 no-print">
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Separator className="my-4"/>
            <div className="text-center">
                <h2 className="font-headline text-2xl font-bold text-primary">Dr. Rajesh Kumar</h2>
                <p>MBBS, MD (General Medicine)</p>
                <p className="text-sm text-muted-foreground">Reg. No. 12345</p>
                <Separator className="my-2"/>
                <p className="font-bold">ClinicEase Clinic</p>
                <p className="text-sm">123 Health St, Wellness City, India</p>
                <p className="text-sm">Phone: +91 98765 43210 | Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
                <h3 className="font-bold mb-2">Patient Details</h3>
                <p><strong>Name:</strong> John Doe, <strong>Age:</strong> 35, <strong>Gender:</strong> Male, <strong>ID:</strong> P12345678</p>
            </div>
            
            <div className="mt-4 rounded-md border p-4">
                <h3 className="font-bold mb-2">Provisional Diagnosis</h3>
                <p>Viral Fever</p>
            </div>

            <div className="mt-4 rounded-md border p-4">
                <h3 className="font-bold mb-2">Tests Advised</h3>
                <p>Complete Blood Count (CBC)</p>
            </div>

            <div className="mt-4">
                <h3 className="font-bold mb-2">Prescription</h3>
                <MarkdownTable content={prescription.prescriptionTable} />
            </div>

            <div className="mt-4 rounded-md border p-4">
                <h3 className="font-bold mb-2">Additional Notes</h3>
                <p>Take adequate rest and stay hydrated.</p>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-end">
                <div>
                    <p><strong>Follow-up Date:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-center">
                    <div className="h-12"></div>
                    <p className="border-t-2 pt-1">Doctor's Signature</p>
                </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
