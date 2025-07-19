
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
import { Loader2, Printer, Download, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownTable } from './MarkdownTable';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ComboboxField = ({ form, name, suggestions, placeholder }: { form: any, name: string, suggestions: string[], placeholder: string }) => {
    const [open, setOpen] = useState(false);
    const [customValue, setCustomValue] = useState("");

    const currentFieldValue = form.watch(name);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !currentFieldValue && "text-muted-foreground"
              )}
            >
              {currentFieldValue
                ? suggestions.find(
                    (s) => s.toLowerCase() === currentFieldValue.toLowerCase()
                  ) || currentFieldValue
                : `Select ${placeholder}`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
              <CommandInput 
                placeholder={`Search ${placeholder}...`} 
                value={customValue}
                onValueChange={setCustomValue}
              />
              <CommandEmpty>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onSelect={() => {
                        form.setValue(name, customValue);
                        setOpen(false);
                    }}
                   >
                     Add "{customValue}"
                   </Button>
              </CommandEmpty>
              <CommandList>
                  <CommandGroup>
                      {suggestions.map((suggestion) => (
                      <CommandItem
                          value={suggestion}
                          key={suggestion}
                          onSelect={() => {
                            form.setValue(name, suggestion);
                            setCustomValue(suggestion);
                            setOpen(false);
                          }}
                      >
                          <Check
                          className={cn(
                              "mr-2 h-4 w-4",
                              suggestion === currentFieldValue ? "opacity-100" : "opacity-0"
                          )}
                          />
                          {suggestion}
                      </CommandItem>
                      ))}
                  </CommandGroup>
              </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

const medicineSchema = z.object({
  name: z.string().min(1, 'Drug name is required.'),
  dosageValue: z.string().min(1, 'Dosage value is required.'),
  dosageUnit: z.string().min(1, 'Dosage unit is required.'),
  frequencyValue: z.string().min(1, 'Frequency is required.'),
  frequencyUnit: z.string().min(1, 'Unit is required.'),
  durationValue: z.string().min(1, 'Duration is required.'),
  durationUnit: z.string().min(1, 'Unit is required.'),
  instructions: z.string().optional(),
});

const formSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  patientAge: z.string().min(1, 'Patient age is required.'),
  patientGender: z.string().min(1, 'Patient gender is required.'),
  toothChartNotes: z.string().optional(),
  provisionalDiagnosis: z.string().min(1, 'Diagnosis is required.'),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required.'),
  testsAdvised: z.array(z.object({ value: z.string().min(1, 'Test name cannot be empty.')})).optional(),
  additionalNotes: z.string().optional(),
  followUpDate: z.string().optional(),
});


const dosageUnits = ["mg", "mcg", "g", "ml", "tsp", "tbsp", "IU", "drops"];
const durationUnits = ["Days", "Weeks", "Months", "Year(s)"];
const frequencyUnits = ["daily", "weekly", "monthly"];
const instructionSuggestions = ["Before food", "After food", "With meals", "Empty stomach"];
const commonTests = ["OPG", "IOPA", "CBCT", "Biopsy"];

export function DentalPrescriptionGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [opdSummary, setOpdSummary] = useState<GeneratePrescriptionOutput['opdSummary'] | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: '',
      patientGender: '',
      toothChartNotes: '',
      provisionalDiagnosis: '',
      medicines: [{ name: '', dosageValue: '', dosageUnit: 'mg', frequencyValue: '2', frequencyUnit: 'daily', durationValue: '', durationUnit: 'Days', instructions: 'After food' }],
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

    const transformedValues = {
        ...values,
        medicines: values.medicines.map(m => ({
            name: m.name,
            dosage: `${m.dosageValue} ${m.dosageUnit}`,
            frequency: `${m.frequencyValue} time(s) ${m.frequencyUnit}`,
            duration: `${m.durationValue} ${m.durationUnit}`,
            instructions: m.instructions,
        })),
        testsAdvised: values.testsAdvised?.map(t => t.value),
    };

    try {
      // NOTE: We are still using the general prescription flow.
      // A dedicated dental flow might be needed if the tooth chart needs AI processing.
      const result = await generatePrescription(transformedValues);
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
    const printableArea = document.getElementById('printable-prescription');
    if (!printableArea) return;

    const printContents = printableArea.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleDownload = async () => {
    const input = document.getElementById('printable-prescription');
    if (input) {
      const noPrintElements = Array.from(input.querySelectorAll('.no-print')) as HTMLElement[];
      noPrintElements.forEach(el => (el.style.display = 'none'));

      try {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = pdfWidth / canvasWidth;
        const pdfHeight = canvasHeight * ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`opd-summary-${opdSummary?.patientDetails.name.replace(/ /g, '_') || 'patient'}.pdf`);

      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          variant: 'destructive',
          title: 'Error Downloading PDF',
          description: 'Could not generate PDF. Please try again.',
        });
      } finally {
        noPrintElements.forEach(el => (el.style.display = ''));
      }
    }
  };
  
  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 no-print">
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
            <CardHeader><CardTitle>Tooth Chart & Notes</CardTitle></CardHeader>
            <CardContent>
                <FormField control={form.control} name="toothChartNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes related to specific teeth (e.g., #16-Caries, #24-RCT)</FormLabel>
                      <FormControl><Textarea placeholder="Enter any notes related to the tooth chart..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
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
                                <Input placeholder="e.g., OPG" {...field} />
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
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/20">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-4 items-start">
                      <FormField control={form.control} name={`medicines.${index}.name`} render={({ field }) => (
                          <FormItem className="lg:col-span-3"><FormLabel>Drug Name</FormLabel><FormControl><Input placeholder="e.g., Amoxicillin" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                          <FormField control={form.control} name={`medicines.${index}.dosageValue`} render={({ field }) => (
                              <FormItem><FormLabel>Dosage</FormLabel><FormControl><Input type="number" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`medicines.${index}.dosageUnit`} render={({ field }) => (
                              <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                  <SelectContent>{dosageUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                      </div>
                      <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                          <FormField control={form.control} name={`medicines.${index}.frequencyValue`} render={({ field }) => (
                              <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input type="number" placeholder="3" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`medicines.${index}.frequencyUnit`} render={({ field }) => (
                              <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                  <SelectContent>{frequencyUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                      </div>
                       <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                          <FormField control={form.control} name={`medicines.${index}.durationValue`} render={({ field }) => (
                              <FormItem><FormLabel>Duration</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`medicines.${index}.durationUnit`} render={({ field }) => (
                              <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>{durationUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                      </div>
                       <div className="lg:col-span-3">
                          <FormLabel>Instructions</FormLabel>
                          <ComboboxField form={form} name={`medicines.${index}.instructions`} suggestions={instructionSuggestions} placeholder="Instructions" />
                      </div>
                    </div>
                   {medicineFields.length > 1 && (
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeMedicine(index)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => appendMedicine({ name: '', dosageValue: '', dosageUnit: 'mg', frequencyValue: '2', frequencyUnit: 'daily', durationValue: '', durationUnit: 'Days', instructions: 'After food' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Another Medicine
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

      {isLoading && (
         <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is thinking... please wait.</p>
            </div>
         </div>
      )}

      {opdSummary && (
        <div id="printable-prescription">
        <Card className="mt-6 printable-area">
          <CardHeader>
            <div className="flex items-center justify-between no-print">
                <CardTitle>Generated OPD Summary</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
                </div>
            </div>
            <Separator className="my-4 no-print"/>
            <div className="text-center space-y-1">
                <h2 className="font-headline text-2xl font-bold text-primary">ClinicEase Clinic</h2>
                <p className="font-semibold text-lg">Dr. Rajesh Kumar, MBBS, MD (General Medicine)</p>
                <p className="text-sm text-muted-foreground">Reg. No. 12345</p>
                <Separator className="my-2"/>
                <p className="text-sm">123 Health St, Wellness City, India | Phone: +91 98765 43210 | Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
                <h3 className="font-bold mb-2">Patient Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div><strong>Name:</strong> {opdSummary.patientDetails.name}</div>
                  <div><strong>Age:</strong> {opdSummary.patientDetails.age}</div>
                  <div><strong>Gender:</strong> {opdSummary.patientDetails.gender}</div>
                </div>
            </div>
            
            <div className="rounded-md border p-4">
                <h3 className="font-bold mb-2">Provisional Diagnosis</h3>
                <p>{opdSummary.provisionalDiagnosis}</p>
            </div>

            {opdSummary.testsAdvised && (
              <div className="rounded-md border p-4">
                  <h3 className="font-bold mb-2">Tests Advised</h3>
                  <p>{opdSummary.testsAdvised}</p>
              </div>
            )}

            <div>
                <h3 className="font-bold mb-2">Prescription</h3>
                <MarkdownTable content={opdSummary.prescriptionTable} />
            </div>

            {opdSummary.additionalNotes && (
              <div className="rounded-md border p-4">
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
        </div>
      )}
    </div>
  );
}
