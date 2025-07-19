'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownTable } from './MarkdownTable';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type GeneratedSummary = {
  patientDetails: {
    name: string;
    age: string;
    gender: string;
  };
  provisionalDiagnosis: string;
  prescriptionTable?: string;
  testsAdvised?: string;
  additionalNotes?: string;
  followUpDate?: string;
};

const medicineSchema = z.object({
  name: z.string(),
  dosageValue: z.string(),
  dosageUnit: z.string(),
  frequencyValue: z.string(),
  frequencyUnit: z.string(),
  durationValue: z.string(),
  durationUnit: z.string(),
  instructions: z.string().optional(),
}).partial().refine(data => {
    const hasValue = Object.values(data).some(val => val && val.trim() !== '');
    if (!hasValue) return true;
    return !!data.name && data.name.trim() !== '';
}, { message: "Drug name is required.", path: ['name']});


const formSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  patientAge: z.string().min(1, 'Patient age is required.'),
  patientGender: z.string().min(1, 'Patient gender is required.'),
  provisionalDiagnosis: z.string().min(1, 'Diagnosis is required.'),
  medicines: z.array(medicineSchema).optional(),
  testsAdvised: z.array(z.object({ value: z.string().min(1, 'Test name cannot be empty.')})).optional(),
  additionalNotes: z.string().optional(),
  followUpDate: z.string().optional(),
});


const dosageUnits = ["mg", "mcg", "g", "ml", "tsp", "tbsp", "IU", "drops"];
const durationUnits = ["Days", "Weeks", "Months", "Year(s)"];
const frequencyUnits = ["daily", "weekly", "monthly"];
const instructionSuggestions = ["Before food", "After food", "With meals", "Empty stomach"];

export function PrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [opdSummary, setOpdSummary] = useState<GeneratedSummary | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: '',
      patientGender: '',
      provisionalDiagnosis: '',
      medicines: [],
      testsAdvised: [],
      additionalNotes: '',
      followUpDate: '',
    },
  });

  const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({
    control: form.control,
    name: "medicines"
  });

  const { fields: testFields, append: appendTest, remove: removeTest } = useFieldArray({
    control: form.control,
    name: "testsAdvised"
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setOpdSummary(null);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const filteredMedicines = values.medicines
            ?.filter(m => Object.values(m).some(val => val && val.trim() !== '')) || [];

        const prescriptionTable = filteredMedicines.length > 0 ? [
            '| Medicine | Dosage | Frequency | Duration | Instructions |',
            '|---|---|---|---|---|',
            ...filteredMedicines.map(m => {
                const dosage = `${m.dosageValue || ''} ${m.dosageUnit || ''}`.trim();
                const frequency = `${m.frequencyValue || ''} time(s) ${m.frequencyUnit || ''}`.trim();
                const duration = `${m.durationValue || ''} ${m.durationUnit || ''}`.trim();
                return `| ${m.name || ''} | ${dosage} | ${frequency} | ${duration} | ${m.instructions || ''} |`;
            })
        ].join('\n') : undefined;

        const summary: GeneratedSummary = {
            patientDetails: {
                name: values.patientName,
                age: values.patientAge,
                gender: values.patientGender,
            },
            provisionalDiagnosis: values.provisionalDiagnosis,
            testsAdvised: values.testsAdvised?.map(t => t.value).join(', ') || undefined,
            prescriptionTable,
            additionalNotes: values.additionalNotes || undefined,
            followUpDate: values.followUpDate || undefined,
        };

        setOpdSummary(summary);
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
      <div className="no-print">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="patientName" render={({ field }) => (
                    <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="patientAge" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input placeholder="e.g., 35" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="patientGender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Provisional Diagnosis</CardTitle></CardHeader>
              <CardContent>
                  <FormField control={form.control} name="provisionalDiagnosis" render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="e.g., Acute Gastroenteritis" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Tests Advised</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`testsAdvised.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                              <FormControl>
                                  <Input placeholder="e.g., Complete Blood Count (CBC)" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeTest(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendTest({ value: '' })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Prescription</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {medicineFields.map((field, index) => (
                   <div key={field.id} className="p-4 border rounded-lg bg-muted/20 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="space-y-4 flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`medicines.${index}.name`} render={({ field }) => (
                                        <FormItem><FormLabel>Drug Name</FormLabel><FormControl><Input placeholder="e.g., Paracetamol" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField
                                        control={form.control}
                                        name={`medicines.${index}.instructions`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Instructions</FormLabel>
                                            <FormControl>
                                            <Input
                                                placeholder="e.g., After food"
                                                {...field}
                                                list={`instructions-suggestions-${index}`}
                                            />
                                            </FormControl>
                                            <datalist id={`instructions-suggestions-${index}`}>
                                            {instructionSuggestions.map((suggestion) => (
                                                <option key={suggestion} value={suggestion} />
                                            ))}
                                            </datalist>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormItem><FormLabel>Dosage</FormLabel>
                                        <div className="flex gap-2">
                                        <FormField control={form.control} name={`medicines.${index}.dosageValue`} render={({ field }) => (
                                            <FormItem className="flex-grow"><FormControl><Input type="number" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`medicines.${index}.dosageUnit`} render={({ field }) => (
                                            <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>{dosageUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage /></FormItem>
                                        )} />
                                        </div>
                                    </FormItem>
                                    <FormItem><FormLabel>Frequency</FormLabel>
                                        <div className="flex gap-2">
                                        <FormField control={form.control} name={`medicines.${index}.frequencyValue`} render={({ field }) => (
                                            <FormItem className="flex-grow"><FormControl><Input type="number" placeholder="3" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`medicines.${index}.frequencyUnit`} render={({ field }) => (
                                            <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>{frequencyUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage /></FormItem>
                                        )} />
                                        </div>
                                    </FormItem>
                                    <FormItem><FormLabel>Duration</FormLabel>
                                        <div className="flex gap-2">
                                        <FormField control={form.control} name={`medicines.${index}.durationValue`} render={({ field }) => (
                                            <FormItem className="flex-grow"><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`medicines.${index}.durationUnit`} render={({ field }) => (
                                            <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>{durationUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage /></FormItem>
                                        )} />
                                        </div>
                                    </FormItem>
                                </div>
                            </div>
                            <div className="flex items-end h-10">
                                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeMedicine(index)}>
                                        <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                   </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendMedicine({ name: '', dosageValue: '', dosageUnit: 'mg', frequencyValue: '2', frequencyUnit: 'daily', durationValue: '', durationUnit: 'Days', instructions: 'After food' })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Drug
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Notes & Follow-up</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                      <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea placeholder="e.g., Take adequate rest and stay hydrated." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="followUpDate" render={({ field }) => (
                      <FormItem><FormLabel>Follow-up Date</FormLabel><FormControl><Input placeholder="e.g., After 3 days" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate OPD Summary
            </Button>
          </form>
        </Form>
      </div>

      {isLoading && (
         <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Generating summary...</p>
            </div>
         </div>
      )}

      {opdSummary && (
        <Card id="printable-prescription" className="mt-6 border-2 border-black">
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-headline text-xl font-bold text-primary">ClinicEase Clinic</h2>
                  <p className="font-semibold">Dr. Rajesh Kumar, MBBS, MD (General Medicine)</p>
                  <p className="text-xs text-muted-foreground">Reg. No. 12345</p>
                  <p className="text-xs">123 Health St, Wellness City, India | Phone: +91 98765 43210</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                    <div className="flex gap-2 justify-end mt-2 no-print">
                        <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
            <Separator className="my-2 bg-black"/>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
              <div className="rounded-md border p-2">
                  <h3 className="font-bold mb-1">Patient Details</h3>
                  <div className="grid grid-cols-3 gap-x-4">
                  <div><strong>Name:</strong> {opdSummary.patientDetails.name}</div>
                  <div><strong>Age:</strong> {opdSummary.patientDetails.age}</div>
                  <div><strong>Gender:</strong> {opdSummary.patientDetails.gender}</div>
                  </div>
              </div>
              
              <div className="rounded-md border p-2">
                  <h3 className="font-bold mb-1">Provisional Diagnosis</h3>
                  <p>{opdSummary.provisionalDiagnosis}</p>
              </div>

              {opdSummary.testsAdvised && (
              <div className="rounded-md border p-2">
                  <h3 className="font-bold mb-1">Tests Advised</h3>
                  <p>{opdSummary.testsAdvised}</p>
              </div>
              )}

              {opdSummary.prescriptionTable && (
              <div>
                  <h3 className="font-bold mb-1">Prescription (Rx)</h3>
                  <MarkdownTable content={opdSummary.prescriptionTable} />
              </div>
              )}

              {opdSummary.additionalNotes && (
              <div className="rounded-md border p-2">
                  <h3 className="font-bold mb-1">Additional Notes</h3>
                  <p>{opdSummary.additionalNotes}</p>
              </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-end pt-8">
                  <div>
                     <p className="text-xs"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                    {opdSummary.followUpDate && (
                        <p className="text-xs"><strong>Follow-up:</strong> {opdSummary.followUpDate}</p>
                    )}
                  </div>
                  <div className="text-center">
                      <div className="h-10"></div>
                      <p className="border-t-2 pt-1 text-xs">Doctor's Signature</p>
                  </div>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
