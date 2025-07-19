'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generatePrescription, type GeneratePrescriptionOutput } from '@/ai/flows/generate-prescription';
import { Loader2, Printer, Download, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { MarkdownTable } from './MarkdownTable';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  patientAge: z.string().min(1, 'Patient age is required.'),
  patientGender: z.string().min(1, 'Patient gender is required.'),
  provisionalDiagnosis: z.string().min(1, 'Diagnosis is required.'),
  medicines: z.array(z.object({
    name: z.string().min(1, 'Drug name is required.'),
    dosage: z.string().min(1, 'Dosage is required.'),
    frequency: z.string().min(1, 'Frequency is required.'),
    duration: z.string().min(1, 'Duration is required.'),
    instructions: z.string().optional(),
  })).min(1, 'At least one medicine is required.'),
  testsAdvised: z.string().optional(),
  additionalNotes: z.string().optional(),
  followUpDate: z.string().optional(),
});

export function PrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [opdSummary, setOpdSummary] = useState<GeneratePrescriptionOutput['opdSummary'] | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: '',
      patientGender: '',
      provisionalDiagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      testsAdvised: '',
      additionalNotes: '',
      followUpDate: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setOpdSummary(null);
    try {
      const result = await generatePrescription(values);
      setOpdSummary(result.opdSummary);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl><Input placeholder="e.g., 35" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl><Input placeholder="e.g., Male" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="provisionalDiagnosis"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Provisional Diagnosis</FormLabel>
                        <FormControl><Input placeholder="e.g., Viral Fever" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="testsAdvised"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tests Advised</FormLabel>
                        <FormControl><Input placeholder="e.g., Complete Blood Count (CBC)" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormField control={form.control} name={`medicines.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Medicine</FormLabel><FormControl><Input placeholder="e.g., Paracetamol" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`medicines.${index}.dosage`} render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 500mg" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`medicines.${index}.frequency`} render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., 1-1-1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`medicines.${index}.duration`} render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 3 days" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`medicines.${index}.instructions`} render={({ field }) => (<FormItem><FormLabel>Instructions</FormLabel><FormControl><Input placeholder="e.g., After food" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   {fields.length > 1 && (
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Medicine
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Notes & Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl><Textarea placeholder="e.g., Take adequate rest and stay hydrated." {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Follow-up Date</FormLabel>
                        <FormControl><Input placeholder="e.g., After 3 days" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate OPD Summary
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

      {opdSummary && (
        <Card className="mt-6 printable-area" id="printable-prescription">
          <CardHeader>
            <div className="flex items-center justify-between no-print">
                <CardTitle>Generated OPD Summary</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Separator className="my-4 no-print"/>
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
                <p><strong>Name:</strong> {opdSummary.patientDetails.name}, <strong>Age:</strong> {opdSummary.patientDetails.age}, <strong>Gender:</strong> {opdSummary.patientDetails.gender}</p>
            </div>
            
            <div className="mt-4 rounded-md border p-4">
                <h3 className="font-bold mb-2">Provisional Diagnosis</h3>
                <p>{opdSummary.provisionalDiagnosis}</p>
            </div>

            {opdSummary.testsAdvised && (
              <div className="mt-4 rounded-md border p-4">
                  <h3 className="font-bold mb-2">Tests Advised</h3>
                  <p>{opdSummary.testsAdvised}</p>
              </div>
            )}

            <div className="mt-4">
                <h3 className="font-bold mb-2">Prescription</h3>
                <MarkdownTable content={opdSummary.prescriptionTable} />
            </div>

            {opdSummary.additionalNotes && (
              <div className="mt-4 rounded-md border p-4">
                  <h3 className="font-bold mb-2">Additional Notes</h3>
                  <p>{opdSummary.additionalNotes}</p>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex justify-between items-end">
                <div>
                  {opdSummary.followUpDate && (
                    <p><strong>Follow-up:</strong> {opdSummary.followUpDate}</p>
                  )}
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
