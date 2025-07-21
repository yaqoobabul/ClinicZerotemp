
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, Phone, Mail, Printer, FileText, PlusCircle, Stethoscope, BriefcaseMedical, Home, VenetianMask } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothIcon } from '@/components/icons/ToothIcon';

type Visit = {
  date: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  prescription: string[];
  testsAdvised?: string;
  notes?: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatarUrl: string;
  email: string;
  phone: string;
  address: string;
  govtId: string;
  visits: Visit[];
};

const newPatientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.coerce.number().min(1, 'Age is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(1, 'Address is required'),
    govtId: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

const toTitleCase = (str: string) => str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';


export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isNewVisitDialogOpen, setIsNewVisitDialogOpen] = useState(false);
  const router = useRouter();


  const form = useForm<z.infer<typeof newPatientSchema>>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      name: '',
      age: '' as any,
      gender: '',
      email: '',
      phone: '',
      address: '',
      govtId: '',
    },
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePrint = () => {
    window.print();
  };

  const handleAddNewPatient = (values: z.infer<typeof newPatientSchema>) => {
    const newPatient: Patient = {
        id: `CZ-${Date.now().toString().slice(-6)}`,
        ...values,
        name: toTitleCase(values.name),
        address: toTitleCase(values.address),
        email: values.email || '',
        govtId: values.govtId || '',
        avatarUrl: `https://placehold.co/40x40.png?text=${values.name[0]}`,
        visits: [],
    };
    setPatients(prev => [...prev, newPatient]);
    form.reset({
      name: '',
      age: '' as any,
      gender: '',
      email: '',
      phone: '',
      address: '',
      govtId: '',
    });
    setIsNewPatientDialogOpen(false);
    setSelectedPatient(newPatient);
  }

  const handleNavigateToVisit = (type: 'medical' | 'dental') => {
    if (!selectedPatient) return;
    const path = type === 'medical' ? '/prescriptions' : '/dental';
    
    const queryParams = new URLSearchParams({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age.toString(),
        patientGender: selectedPatient.gender,
        patientContact: selectedPatient.phone,
        patientAddress: selectedPatient.address,
        govtId: selectedPatient.govtId,
    });
    
    router.push(`${path}?${queryParams.toString()}`);
  }

  if (selectedPatient) {
    return (
      <>
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Patient Profile</h1>
          <div className="ml-auto">
             <Button variant="outline" onClick={() => setIsNewVisitDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Visit
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedPatient.avatarUrl} alt={selectedPatient.name} data-ai-hint="person portrait" />
                <AvatarFallback>{selectedPatient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{selectedPatient.name}</CardTitle>
                <CardDescription className="text-base">ID: {selectedPatient.id} &bull; {selectedPatient.age} years old &bull; {selectedPatient.gender}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground"/>
                    <span>{selectedPatient.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground"/>
                    <span>{selectedPatient.phone}</span>
                </div>
                 <div className="flex items-center col-span-2 gap-2 text-sm">
                    <Home className="h-4 w-4 text-muted-foreground"/>
                    <span>{selectedPatient.address}</span>
                </div>
                <div className="flex items-center col-span-2 gap-2 text-sm">
                    <BriefcaseMedical className="h-4 w-4 text-muted-foreground"/>
                    <span>Govt. ID: {selectedPatient.govtId || 'N/A'}</span>
                </div>
            </div>
            <Separator/>
            <div>
              <h3 className="text-xl font-semibold mb-2">Visit History</h3>
              {selectedPatient.visits.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p>No visit history found.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                    {selectedPatient.visits.map((visit, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                            <span>{visit.date}</span>
                            <span className="text-muted-foreground">{visit.diagnosis}</span>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pl-2">
                        <p><strong>Doctor:</strong> {visit.doctor}</p>
                        <p><strong>Chief Complaint:</strong> {visit.complaint}</p>
                        <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                        <p><strong>Prescription:</strong> {visit.prescription.join(' ')}</p>
                        <Button variant="secondary" size="sm" onClick={() => setViewingVisit(visit)}>
                            <FileText className="mr-2 h-4 w-4"/>
                            View Report
                        </Button>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={!!viewingVisit} onOpenChange={(isOpen) => !isOpen && setViewingVisit(null)}>
          <DialogContent className="max-w-4xl p-0">
             {viewingVisit && (
                <>
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="sr-only">Visit Report for {selectedPatient.name}</DialogTitle>
                    <DialogDescription className="sr-only">
                        A printable summary of the patient's visit on {new Date(viewingVisit.date).toLocaleDateString()}.
                    </DialogDescription>
                </DialogHeader>
                <div id="printable-prescription" className="p-8">
                  <div className="text-sm">
                      <div className="flex items-start justify-between">
                          <div>
                              <h2 className="text-base font-bold text-primary">ClinicZero</h2>
                              <p>123 Health St, Wellness City, India | Phone: +91 98765 43210</p>
                              <p className="font-semibold">Dr. {viewingVisit.doctor}</p>
                              <p className="text-muted-foreground">Reg. No. 12345</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                              <p><strong>Date:</strong> {new Date(viewingVisit.date).toLocaleString('en-IN')}</p>
                          </div>
                      </div>
                      <div className="flex justify-end mt-1 no-print">
                          <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                      </div>
                      <Separator className="my-1 bg-black"/>
                      <div className="px-1 space-y-2">
                          <div className="mb-1">
                            <h3 className="font-bold">Patient Details</h3>
                            <div className="grid grid-cols-3 gap-x-4">
                              <div><strong>Patient ID:</strong> {selectedPatient.id}</div>
                              <div><strong>Name:</strong> {selectedPatient.name}</div>
                              <div><strong>Age/Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</div>
                              <div className="col-span-2"><strong>Address:</strong> {selectedPatient.address}</div>
                            </div>
                          </div>

                          <div>
                              <h3 className="font-bold">Chief Complaint</h3>
                              <p>{viewingVisit.complaint}</p>
                          </div>

                          <div>
                              <h3 className="font-bold">Diagnosis</h3>
                              <p>{viewingVisit.diagnosis}</p>
                          </div>

                          {viewingVisit.testsAdvised && (
                          <div>
                              <h3 className="font-bold">Tests Advised</h3>
                              <p>{viewingVisit.testsAdvised}</p>
                          </div>
                          )}

                          <div>
                              <h3 className="font-bold">Prescription (Rx)</h3>
                              <ul className="list-disc list-inside">
                                {viewingVisit.prescription.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                          </div>

                          {viewingVisit.notes && (
                          <div>
                              <h3 className="font-bold">Additional Notes</h3>
                              <p>{viewingVisit.notes}</p>
                          </div>
                          )}
                      </div>
                      <div className="text-right mt-16">
                          <p className="border-t-2 border-black pt-1 font-semibold inline-block">Dr. {viewingVisit.doctor}</p>
                      </div>
                  </div>
                </div>
                </>
             )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={isNewVisitDialogOpen} onOpenChange={setIsNewVisitDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Visit</DialogTitle>
                <DialogDescription>
                    Choose the type of OPD visit for {selectedPatient.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleNavigateToVisit('medical')}>
                    <Stethoscope className="h-8 w-8"/>
                    <span className="text-base">Medical OPD</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleNavigateToVisit('dental')}>
                    <ToothIcon className="h-8 w-8"/>
                    <span className="text-base">Dental OPD</span>
                </Button>
            </div>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <>
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0 flex-row justify-between items-center">
            <div>
                <CardTitle className="text-2xl">Patient Management</CardTitle>
                <CardDescription>
                    Search for patients or add a new one.
                </CardDescription>
            </div>
            <Button onClick={() => setIsNewPatientDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Patient
            </Button>
        </CardHeader>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search patients by name or ID..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map(patient => (
                <Card 
                    key={patient.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedPatient(patient)}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">{patient.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        {patients.length > 0 && filteredPatients.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                <p>No patients found for your search.</p>
            </div>
        )}
        {patients.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                <p className="mb-2 font-semibold">No Patients Yet</p>
                <p>Click "New Patient" to add your first patient record.</p>
            </div>
        )}
    </div>
    
    <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                    Enter the details for the new patient.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddNewPatient)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} onBlur={(e) => field.onChange(toTitleCase(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="age" render={({ field }) => (
                            <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="gender" render={({ field }) => (
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
                    </div>
                     <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} onBlur={(e) => field.onChange(toTitleCase(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="govtId" render={({ field }) => (
                        <FormItem><FormLabel>Govt. ID (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Patient</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}

    