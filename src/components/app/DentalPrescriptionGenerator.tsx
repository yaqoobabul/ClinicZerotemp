
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Plus, Trash2, Search } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothChart } from './ToothChart';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Switch } from '@/components/ui/switch';

type GeneratedSummary = {
  patientDetails: {
    id?: string;
    name: string;
    age: string;
    contact?: string;
    address?: string;
    govtId?: string;
  };
  vitals?: {
    height?: string;
    weight?: string;
    bp?: string;
    pulse?: string;
    spo2?: string;
    temp?: string;
  };
  examinationFindings?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  diagnosisLabel: string;
  provisionalDiagnosis: string;
  toothChartNotes?: string;
  prescriptionTable?: string;
  radiographsAdvised?: string;
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
  instructions: z.string(),
}).refine(
    (data) => {
      if (data.name && data.name.trim() !== '') {
        return (
          data.dosageValue && data.dosageValue.trim() !== '' &&
          data.frequencyValue && data.frequencyValue.trim() !== '' &&
          data.durationValue && data.durationValue.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Dosage, frequency, and duration are required.',
      path: ['dosageValue'],
    }
);


const toothNoteSchema = z.object({
  tooth: z.string(),
  note: z.string(),
});

const radiographSchema = z.object({
  type: z.string(),
  toothNumber: z.string().optional(),
});

const testAdvisedSchema = z.object({
  value: z.string()
});


const formSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().min(1, 'Patient name is required.'),
  patientAge: z.string().min(1, 'Patient age is required.'),
  patientContact: z.string().optional(),
  patientAddress: z.string().optional(),
  govtId: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bp: z.string().optional(),
  pulse: z.string().optional(),
  spo2: z.string().optional(),
  temp: z.string().optional(),
  examinationFindings: z.string().optional(),
  chiefComplaint: z.string().optional(),
  medicalHistory: z.string().optional(),
  isFinalDiagnosis: z.boolean().default(false),
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

// Helper functions for capitalization
const toTitleCase = (str: string) => str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';
const capitalizeFirstLetter = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export function DentalPrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [opdSummary, setOpdSummary] = useState<GeneratedSummary | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      patientName: '',
      patientAge: '',
      patientContact: '',
      patientAddress: '',
      govtId: '',
      height: '',
      weight: '',
      bp: '',
      pulse: '',
      spo2: '',
      temp: '',
      examinationFindings: '',
      chiefComplaint: '',
      medicalHistory: '',
      isFinalDiagnosis: false,
      toothNotes: [],
      provisionalDiagnosis: '',
      medicines: [],
      radiographsAdvised: [],
      testsAdvised: [],
      additionalNotes: '',
      followUpDate: '',
    },
  });

  const isFinalDiagnosis = form.watch('isFinalDiagnosis');

  useEffect(() => {
    // Pre-fill from query params if available
    const patientId = searchParams.get('patientId');
    if (patientId) {
        form.setValue('patientId', patientId);
        form.setValue('patientName', toTitleCase(searchParams.get('patientName') || ''));
        form.setValue('patientAge', searchParams.get('patientAge') || '');
        form.setValue('patientContact', searchParams.get('patientContact') || '');
        form.setValue('patientAddress', toTitleCase(searchParams.get('patientAddress') || ''));
        form.setValue('govtId', searchParams.get('govtId') || '');
    } else if (!form.getValues('patientId')) {
        // Auto-generate a patient ID for new patients
        const newPatientId = `CZ-${Date.now().toString().slice(-6)}`;
        form.setValue('patientId', newPatientId);
    }
  }, [searchParams, form]);


  const handleFetchPatient = () => {
    const patientId = form.getValues('patientId');
    // Placeholder for fetching patient data from a database
    // In a real app, this would make an API call
    alert(`Fetching data for Patient ID: ${patientId}\n(This is a placeholder - no database is connected yet)`);
  };

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
                return `| ${m.name.toUpperCase() || ''} | ${dosage} | ${frequency} | ${duration} | ${m.instructions || ''} |`;
            })
        ].join('\n') : undefined;

        const radiographs = filteredRadiographs
            ?.map(r => r.toothNumber ? `${r.type} (w.r.t #${r.toothNumber})` : r.type)
            .join(', ') || undefined;

        const otherTests = filteredTests
            ?.map(t => t.value)
            .join(', ') || undefined;
        
        const vitals = {
            height: values.height || undefined,
            weight: values.weight || undefined,
            bp: values.bp || undefined,
            pulse: values.pulse || undefined,
            spo2: values.spo2 || undefined,
            temp: values.temp || undefined,
        };
        const hasVitals = Object.values(vitals).some(v => v !== undefined);

        const summary: GeneratedSummary = {
            patientDetails: {
                id: values.patientId || undefined,
                name: toTitleCase(values.patientName),
                age: values.patientAge,
                contact: values.patientContact || undefined,
                address: toTitleCase(values.patientAddress || ''),
                govtId: values.govtId || undefined,
            },
            vitals: hasVitals ? vitals : undefined,
            examinationFindings: values.examinationFindings ? capitalizeFirstLetter(values.examinationFindings) : undefined,
            chiefComplaint: values.chiefComplaint ? capitalizeFirstLetter(values.chiefComplaint) : undefined,
            medicalHistory: values.medicalHistory ? capitalizeFirstLetter(values.medicalHistory) : undefined,
            diagnosisLabel: values.isFinalDiagnosis ? 'Final Diagnosis' : 'Provisional Diagnosis',
            provisionalDiagnosis: capitalizeFirstLetter(values.provisionalDiagnosis),
            toothChartNotes: values.toothNotes
                ?.filter(tn => tn.note && tn.note.trim() !== '')
                .map(tn => `#${tn.tooth}: ${tn.note}`)
                .join(', ') || undefined,
            radiographsAdvised: radiographs,
            testsAdvised: otherTests,
            prescriptionTable,
            additionalNotes: values.additionalNotes ? capitalizeFirstLetter(values.additionalNotes) : undefined,
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
                <CardDescription>Enter patient information or fetch existing records by ID.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Patient ID</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" onClick={handleFetchPatient}><Search className="mr-2 h-4 w-4" /> Fetch</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="govtId" render={({ field }) => (
                    <FormItem><FormLabel>Govt. ID Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="patientName" render={({ field }) => (
                        <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input {...field} onBlur={(e) => field.onChange(toTitleCase(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="patientAge" render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="patientContact" render={({ field }) => (
                        <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="patientAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} onBlur={(e) => field.onChange(toTitleCase(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Clinical Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <FormField control={form.control} name="chiefComplaint" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint</FormLabel>
                        <FormControl>
                           <Textarea {...field} placeholder="e.g., Pain in upper right tooth since 2 days" onBlur={(e) => field.onChange(capitalizeFirstLetter(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relevant Medical History</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="text-destructive placeholder:text-destructive/50" placeholder="e.g., Hypertension, Diabetes, Allergy to Penicillin" onBlur={(e) => field.onChange(capitalizeFirstLetter(e.target.value))} />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Vitals &amp; Examination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <FormField control={form.control} name="height" render={({ field }) => (
                            <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="weight" render={({ field }) => (
                            <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="bp" render={({ field }) => (
                            <FormItem><FormLabel>BP (mmHg)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pulse" render={({ field }) => (
                            <FormItem><FormLabel>Pulse (/min)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="spo2" render={({ field }) => (
                            <FormItem><FormLabel>SpO2 (%)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="temp" render={({ field }) => (
                            <FormItem><FormLabel>Temp (°F)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="examinationFindings" render={({ field }) => (
                        <FormItem>
                            <FormLabel>General Examination Findings</FormLabel>
                            <FormControl>
                                <Textarea {...field} onBlur={(e) => field.onChange(capitalizeFirstLetter(e.target.value))} />
                            </FormControl>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{isFinalDiagnosis ? 'Final Diagnosis' : 'Provisional Diagnosis'}</CardTitle>
                    <FormField
                    control={form.control}
                    name="isFinalDiagnosis"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                        <FormLabel className="text-sm font-normal">Final</FormLabel>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </div>
              </CardHeader>
              <CardContent>
                  <FormField control={form.control} name="provisionalDiagnosis" render={({ field }) => (
                      <FormItem><FormControl><Input {...field} onBlur={(e) => field.onChange(capitalizeFirstLetter(e.target.value))} /></FormControl><FormMessage /></FormItem>
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
                                      <Select onValueChange={field.onChange} value={field.value}>
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
                                          <Input {...field} />
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
                                    <FormItem><FormLabel>Drug Name</FormLabel><FormControl><Input {...field} onBlur={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
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
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`medicines.${index}.dosageUnit`} render={({ field }) => (
                                        <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>{dosageUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )} />
                                    </div>
                                </FormItem>
                                <FormItem><FormLabel>Frequency</FormLabel>
                                    <div className="flex gap-2">
                                    <FormField control={form.control} name={`medicines.${index}.frequencyValue`} render={({ field }) => (
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`medicines.${index}.frequencyUnit`} render={({ field }) => (
                                        <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>{frequencyUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                    )} />
                                    </div>
                                </FormItem>
                                <FormItem><FormLabel>Duration</FormLabel>
                                    <div className="flex gap-2">
                                    <FormField control={form.control} name={`medicines.${index}.durationValue`} render={({ field }) => (
                                        <FormItem className="flex-grow"><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`medicines.${index}.durationUnit`} render={({ field }) => (
                                        <FormItem className="w-28 shrink-0"><Select onValueChange={field.onChange} value={field.value}>
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
                <Button type="button" variant="outline" size="sm" onClick={() => appendMedicine({name: '', dosageValue: '', dosageUnit: 'mg', frequencyValue: '', frequencyUnit: 'daily', durationValue: '', durationUnit: 'Days', instructions: ''})}>
                  <Plus className="mr-2 h-4 w-4" /> Add Drug
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Notes & Follow-up</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                      <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} onBlur={(e) => field.onChange(capitalizeFirstLetter(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="followUpDate" render={({ field }) => (
                      <FormItem><FormLabel>Follow-up Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
        <div id="printable-prescription">
            <div className="text-sm">
                <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-primary">ClinicZero</h2>
                      <p>123 Health St, Wellness City, India | Phone: +91 98765 43210</p>
                      <p className="font-semibold">Dr. Rajesh Kumar, MBBS, MD (General Medicine)</p>
                      <p className="text-muted-foreground">Reg. No. 12345</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <p><strong>Date:</strong> {new Date().toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="flex justify-end mt-1 no-print">
                    <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                </div>
                <Separator className="my-1 bg-black"/>
                <div className="px-1">
                    <div className="mb-1">
                        <h3 className="font-bold">Patient Details</h3>
                        <div className="grid grid-cols-3 gap-x-4">
                          <div><strong>Patient ID:</strong> {opdSummary.patientDetails.id || 'N/A'}</div>
                          <div><strong>Name:</strong> {opdSummary.patientDetails.name}</div>
                          <div><strong>Age:</strong> {opdSummary.patientDetails.age}</div>
                          <div><strong>Contact:</strong> {opdSummary.patientDetails.contact || 'N/A'}</div>
                          <div><strong>Govt. ID:</strong> {opdSummary.patientDetails.govtId || 'N/A'}</div>
                          <div className="col-span-2"><strong>Address:</strong> {opdSummary.patientDetails.address || 'N/A'}</div>
                        </div>
                    </div>

                    {opdSummary.chiefComplaint && (
                      <div className='mb-1'>
                          <h3 className="font-bold">Chief Complaint</h3>
                          <p>{opdSummary.chiefComplaint}</p>
                      </div>
                    )}
                    
                    {opdSummary.medicalHistory && (
                      <div className='mb-1'>
                          <h3 className="font-bold text-red-600">Medical History</h3>
                          <p className="text-red-600">{opdSummary.medicalHistory}</p>
                      </div>
                    )}

                    {opdSummary.vitals && (
                    <div className='mb-1'>
                        <h3 className="font-bold">Vitals</h3>
                        <div className="flex flex-wrap gap-x-4">
                            {opdSummary.vitals.height && <p><strong>Height:</strong> {opdSummary.vitals.height} cm</p>}
                            {opdSummary.vitals.weight && <p><strong>Weight:</strong> {opdSummary.vitals.weight} kg</p>}
                            {opdSummary.vitals.bp && <p><strong>BP:</strong> {opdSummary.vitals.bp} mmHg</p>}
                            {opdSummary.vitals.pulse && <p><strong>Pulse:</strong> {opdSummary.vitals.pulse} /min</p>}
                            {opdSummary.vitals.spo2 && <p><strong>SpO2:</strong> {opdSummary.vitals.spo2} %</p>}
                            {opdSummary.vitals.temp && <p><strong>Temp:</strong> {opdSummary.vitals.temp} °F</p>}
                        </div>
                    </div>
                    )}

                    {opdSummary.examinationFindings && (
                        <div className='mb-1'>
                            <h3 className="font-bold">Examination Findings</h3>
                            <p>{opdSummary.examinationFindings}</p>
                        </div>
                    )}

                    {opdSummary.toothChartNotes && (
                    <div className='mb-1'>
                        <h3 className="font-bold">Dental Notes</h3>
                        <p>{opdSummary.toothChartNotes}</p>
                    </div>
                    )}
                    
                    <div className='mb-1'>
                        <h3 className="font-bold">{opdSummary.diagnosisLabel}</h3>
                        <p>{opdSummary.provisionalDiagnosis}</p>
                    </div>
                    
                    {(opdSummary.radiographsAdvised || opdSummary.testsAdvised) && (
                    <div className='mb-1'>
                        <h3 className="font-bold">Investigations Advised</h3>
                        {opdSummary.radiographsAdvised && <p><strong>Radiographs:</strong> {opdSummary.radiographsAdvised}</p>}
                        {opdSummary.testsAdvised && <p><strong>Tests:</strong> {opdSummary.testsAdvised}</p>}
                    </div>
                    )}

                    {prescriptionTableRows.length > 0 && (
                    <div className="mb-1">
                        <h3 className="font-bold">Prescription (Rx)</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left font-semibold py-0.5 pr-2">Medicine</th>
                                    <th className="text-left font-semibold py-0.5 px-2">Dosage</th>
                                    <th className="text-left font-semibold py-0.5 px-2">Frequency</th>
                                    <th className="text-left font-semibold py-0.5 px-2">Duration</th>
                                    <th className="text-left font-semibold py-0.5 pl-2">Instructions</th>
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
                        <h3 className="font-bold">Additional Notes</h3>
                        <p>{opdSummary.additionalNotes}</p>
                    </div>
                    )}
                </div>

                <div className="flex justify-between pt-1">
                    <div>
                      {opdSummary.followUpDate && (
                        <p><strong>Follow-up:</strong> {opdSummary.followUpDate}</p>
                      )}
                    </div>
                    <div className="text-center mt-16">
                        <p className="border-t-2 border-black pt-1 font-semibold">Dr. Rajesh Kumar</p>
                        <p className="text-xs text-muted-foreground">Reg. No. 12345</p>
                        <p className="text-xs">{new Date().toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
