
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Plus, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothChart } from './ToothChart';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';

type GeneratedSummary = {
  patientDetails: {
    name: string;
    age: string;
    gender: string;
  };
  provisionalDiagnosis: string;
  toothChartNotes?: string;
  prescriptionTable?: string;
  radiographsAdvised?: string;
  testsAdvised?: string;
  additionalNotes?: string;
  followUpDate?: string;
};

const medicineSchema = z.object({
  name: z.string().optional(),
  dosageValue: z.string().optional(),
  dosageUnit: z.string().optional(),
  frequencyValue: z.string().optional(),
  frequencyUnit: z.string().optional(),
  durationValue: z.string().optional(),
  durationUnit: z.string().optional(),
  instructions: z.string().optional(),
}).refine(
    (data) => {
      if (data.name && data.name.trim() !== '') {
        return (
          data.dosageValue &&
          data.frequencyValue &&
          data.durationValue
        );
      }
      return true;
    },
    {
      message: 'Dosage, frequency, and duration are required if drug name is filled.',
      path: ['name'], // Show error message on the name field for simplicity
    }
  );


const toothNoteSchema = z.object({
  tooth: z.string(),
  note: z.string(),
});

const radiographSchema = z.object({
  type: z.string().optional(),
  toothNumber: z.string().optional(),
});

const testAdvisedSchema = z.object({
  value: z.string().optional()
});


const formSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  patientAge: z.string().min(1, 'Patient age is required.'),
  patientGender: z.string().min(1, 'Patient gender is required.'),
  toothNotes: z.array(toothNoteSchema).optional(),
  provisionalDiagnosis: z.string().min(1, 'Diagnosis is required.'),
  medicines: z.array(medicineSchema).optional(),
  radiographsAdvised: z.array(radiographSchema).optional(),
  testsAdvised: z.array(testAdvisedSchema).optional(),
  additionalNotes: z.string().optional(),
  followUpDate: z.string().optional(),
});


const dosageUnits = ["mg", "mcg", "g", "ml", "tsp", "tbsp", "IU", "drops"];
const durationUnits = ["Days", "Weeks", "Months", "Year(s)"];
const frequencyUnits = ["daily", "weekly", "monthly"];
const instructionSuggestions = ["Before food", "After food", "With meals", "Empty stomach"];
const radiographTypes = ["OPG", "IOPA", "CBCT", "Bitewing"];

export function DentalPrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [opdSummary, setOpdSummary] = useState<GeneratedSummary | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: '',
      patientGender: '',
      toothNotes: [],
      provisionalDiagnosis: '',
      medicines: [],
      radiographsAdvised: [],
      testsAdvised: [],
      additionalNotes: '',
      followUpDate: '',
    },
  });

  const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({
    control: form.control,
    name: "medicines"
  });

  const { fields: radiographFields, append: appendRadiograph, remove: removeRadiograph } = useFieldArray({
    control: form.control,
    name: "radiographsAdvised"
  });

  const { fields: testFields, append: appendTest, remove: removeTest } = useFieldArray({
    control: form.control,
    name: "testsAdvised"
  });


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setOpdSummary(null);
    
    try {
        const filteredMedicines = values.medicines
            ?.filter(m => m.name && m.name.trim() !== '') || [];
        
        const filteredRadiographs = values.radiographsAdvised?.filter(r => r.type && r.type.trim() !== '');
        const filteredTests = values.testsAdvised?.filter(t => t.value && t.value.trim() !== '');

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

        const radiographs = filteredRadiographs
            ?.map(r => r.toothNumber ? `${r.type} (w.r.t #${r.toothNumber})` : r.type)
            .join(', ') || undefined;

        const otherTests = filteredTests
            ?.map(t => t.value)
            .join(', ') || undefined;

        const summary: GeneratedSummary = {
            patientDetails: {
                name: values.patientName,
                age: values.patientAge,
                gender: values.patientGender,
            },
            provisionalDiagnosis: values.provisionalDiagnosis,
            toothChartNotes: values.toothNotes
                ?.filter(tn => tn.note && tn.note.trim() !== '')
                .map(tn => `#${tn.tooth}: ${tn.note}`)
                .join(', ') || undefined,
            radiographsAdvised: radiographs,
            testsAdvised: otherTests,
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
  
  const prescriptionTableRows = opdSummary?.prescriptionTable
    ? opdSummary.prescriptionTable
        .trim()
        .split('\n')
        .slice(2) // Skip header and separator line
        .map(row =>
          row
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell)
        )
    : [];
  
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
              <CardHeader>
                <CardTitle>Tooth Chart & Notes</CardTitle>
                <CardDescription>Click on a tooth or enter notes in the corresponding box.</CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  control={form.control}
                  name="toothNotes"
                  render={({ field }) => <ToothChart value={field.value || []} onChange={field.onChange} />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Provisional Diagnosis</CardTitle></CardHeader>
              <CardContent>
                  <FormField control={form.control} name="provisionalDiagnosis" render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="e.g., Symptomatic Irreversible Pulpitis" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Investigations Advised</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-4">
                      <h4 className="font-semibold">Radiograph Advised</h4>
                      <div className="space-y-3">
                          {radiographFields.map((field, index) => (
                          <div key={field.id} className="flex items-start gap-2">
                              <FormField
                              control={form.control}
                              name={`radiographsAdvised.${index}.type`}
                              render={({ field }) => (
                                  <FormItem className="flex-grow">
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                              <SelectTrigger>
                                                  <SelectValue placeholder="Select type" />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              {radiographTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name={`radiographsAdvised.${index}.toothNumber`}
                              render={({ field }) => (
                                  <FormItem>
                                      <FormControl>
                                          <Input placeholder="Tooth #" {...field} className="w-24" />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRadiograph(index)}>
                              <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => appendRadiograph({ type: '', toothNumber: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Radiograph
                          </Button>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h4 className="font-semibold">Other Tests Advised</h4>
                      <div className="space-y-3">
                          {testFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                              <FormField
                              control={form.control}
                              name={`testsAdvised.${index}.value`}
                              render={({ field }) => (
                                  <FormItem className="flex-grow">
                                      <FormControl>
                                          <Input placeholder="e.g., Biopsy" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeTest(index)}>
                              <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => appendTest({ value: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Test
                          </Button>
                      </div>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Prescription</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {medicineFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-end md:gap-4">
                        <div className="flex-grow space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <FormField control={form.control} name={`medicines.${index}.name`} render={({ field }) => (
                                    <FormItem><FormLabel>Drug Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField
                                    control={form.control}
                                    name={`medicines.${index}.instructions`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl>
                                        <Input
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
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} className="w-full" /></FormControl><FormMessage /></FormItem>
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
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} className="w-full"/></FormControl><FormMessage /></FormItem>
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
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} className="w-full"/></FormControl><FormMessage /></FormItem>
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
                        <div className="flex items-end h-full">
                            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeMedicine(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendMedicine({name: '', dosageValue: '', dosageUnit: '', frequencyValue: '', frequencyUnit: '', durationValue: '', durationUnit: '', instructions: ''})}>
                  <Plus className="mr-2 h-4 w-4" /> Add Drug
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Notes & Follow-up</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                      <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea placeholder="e.g., Avoid hard foods." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="followUpDate" render={({ field }) => (
                      <FormItem><FormLabel>Follow-up Date</FormLabel><FormControl><Input placeholder="e.g., After 1 week" {...field} /></FormControl><FormMessage /></FormItem>
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
         <div className="flex items-center justify-center rounded-lg border border-dashed p-8 no-print">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Generating summary...</p>
            </div>
         </div>
      )}

      {opdSummary && (
        <div id="printable-prescription" className="p-2">
            <div className="text-[10px]">
                <div className="flex items-start justify-between mb-1">
                    <div>
                      <h2 className="text-sm font-bold text-primary">ClinicEase Clinic</h2>
                      <p className="font-semibold">Dr. Rajesh Kumar, MBBS, MD (General Medicine)</p>
                      <p className="text-muted-foreground">Reg. No. 12345</p>
                      <p>123 Health St, Wellness City, India | Phone: +91 98765 43210</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                </div>
                <div className="flex justify-end mt-1 no-print">
                    <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                </div>
                <Separator className="my-1 bg-black"/>
                <div className="px-1 space-y-1">
                    <div className="mb-1">
                        <h3 className="font-bold text-xs">Patient Details</h3>
                        <div className="grid grid-cols-3 gap-x-4">
                          <div><strong>Name:</strong> {opdSummary.patientDetails.name}</div>
                          <div><strong>Age:</strong> {opdSummary.patientDetails.age}</div>
                          <div><strong>Gender:</strong> {opdSummary.patientDetails.gender}</div>
                        </div>
                    </div>

                    {opdSummary.toothChartNotes && (
                    <div className='mb-1'>
                        <h3 className="font-bold text-xs">Dental Notes</h3>
                        <p>{opdSummary.toothChartNotes}</p>
                    </div>
                    )}
                    
                    <div className='mb-1'>
                        <h3 className="font-bold text-xs">Provisional Diagnosis</h3>
                        <p>{opdSummary.provisionalDiagnosis}</p>
                    </div>
                    
                    {(opdSummary.radiographsAdvised || opdSummary.testsAdvised) && (
                    <div className='mb-1'>
                        <h3 className="font-bold text-xs">Investigations Advised</h3>
                        {opdSummary.radiographsAdvised && <p><strong>Radiographs:</strong> {opdSummary.radiographsAdvised}</p>}
                        {opdSummary.testsAdvised && <p><strong>Tests:</strong> {opdSummary.testsAdvised}</p>}
                    </div>
                    )}

                    {prescriptionTableRows.length > 0 && (
                    <div className="mb-1">
                        <h3 className="font-bold text-xs">Prescription (Rx)</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left font-semibold py-0 pr-2">Medicine</th>
                                    <th className="text-left font-semibold py-0 px-2">Dosage</th>
                                    <th className="text-left font-semibold py-0 px-2">Frequency</th>
                                    <th className="text-left font-semibold py-0 px-2">Duration</th>
                                    <th className="text-left font-semibold py-0 pl-2">Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptionTableRows.map((row, i) => (
                                    <tr key={i} className="border-b">
                                        {row.map((cell, j) => (
                                            <td key={j} className={`py-0.5 ${j === 0 ? 'pr-2' : 'px-2'}`}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}

                    {opdSummary.additionalNotes && (
                    <div className="mb-1">
                        <h3 className="font-bold text-xs">Additional Notes</h3>
                        <p>{opdSummary.additionalNotes}</p>
                    </div>
                    )}
                </div>

                <div className="flex justify-between items-end pt-1">
                    <div>
                      {opdSummary.followUpDate && (
                        <p><strong>Follow-up:</strong> {opdSummary.followUpDate}</p>
                      )}
                    </div>
                    <div className="text-center">
                        <div className="h-8"></div>
                        <p className="border-t-2 border-black pt-1">Doctor's Signature</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

    