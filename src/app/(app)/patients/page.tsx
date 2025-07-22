
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, Phone, Mail, Printer, FileText, PlusCircle, Pencil } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePatients } from '@/context/PatientContext';
import type { Patient, Visit } from '@/types';

const patientFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    age: z.coerce.number().min(0, 'Age must be a positive number'),
    sex: z.enum(['Male', 'Female', 'Other']),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(1, 'Address is required'),
    govtId: z.string().optional(),
});

const newVisitSchema = z.object({
    doctor: z.string().min(1, 'Doctor name is required'),
    complaint: z.string().min(1, 'Chief complaint is required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    prescription: z.string(),
    testsAdvised: z.string().optional(),
    notes: z.string().optional(),
});

export default function PatientsPage() {
  const router = useRouter();
  const { patients, setPatients } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);
  const [isNewVisitDialogOpen, setIsNewVisitDialogOpen] = useState(false);
  const [isNewOldVisitDialogOpen, setIsNewOldVisitDialogOpen] = useState(false);


  const patientForm = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      age: '' as any,
      sex: 'Male',
      email: '',
      phone: '',
      address: '',
      govtId: '',
    },
  });
  
  const visitForm = useForm<z.infer<typeof newVisitSchema>>({
    resolver: zodResolver(newVisitSchema),
    defaultValues: {
      doctor: '',
      complaint: '',
      diagnosis: '',
      prescription: '',
      testsAdvised: '',
      notes: '',
    }
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePrint = () => {
    window.print();
  };

  const handleAddNewPatient = (values: z.infer<typeof patientFormSchema>) => {
    const newPatient: Patient = {
        id: `CZ-${Date.now().toString().slice(-6)}`,
        ...values,
        sex: values.sex as 'Male' | 'Female' | 'Other',
        age: values.age,
        email: values.email || '',
        govtId: values.govtId || '',
        avatarUrl: `https://placehold.co/40x40.png?text=${values.name[0]}`,
        visits: [],
    };
    setPatients(prev => [...prev, newPatient]);
    patientForm.reset();
    setIsNewPatientDialogOpen(false);
    setSelectedPatient(newPatient);
  }

  const handleUpdatePatient = (values: z.infer<typeof patientFormSchema>) => {
      if (!selectedPatient) return;
      const updatedPatient: Patient = { 
        ...selectedPatient, 
        ...values, 
        age: values.age,
        sex: values.sex as 'Male' | 'Female' | 'Other',
        email: values.email || '',
        govtId: values.govtId || '',
      };
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
      setIsEditPatientDialogOpen(false);
  }

  const openEditPatientDialog = () => {
      if(selectedPatient) {
          patientForm.reset({
              ...selectedPatient,
              age: selectedPatient.age || undefined
          });
          setIsEditPatientDialogOpen(true);
      }
  }

  const handleNavigateToVisit = (type: 'medical' | 'dental') => {
    if (!selectedPatient) return;

    const params = new URLSearchParams();
    params.set('patientId', selectedPatient.id);
    params.set('patientName', selectedPatient.name);
    if(selectedPatient.age) params.set('patientAge', selectedPatient.age.toString());
    if(selectedPatient.sex) params.set('patientSex', selectedPatient.sex);
    if(selectedPatient.phone) params.set('patientContact', selectedPatient.phone);
    if(selectedPatient.address) params.set('patientAddress', selectedPatient.address);
    if(selectedPatient.govtId) params.set('govtId', selectedPatient.govtId);

    const path = type === 'medical' ? '/prescriptions' : '/dental';
    router.push(`${path}?${params.toString()}`);
    setIsNewVisitDialogOpen(false);
  };
  
  const handleAddNewOldVisit = (values: z.infer<typeof newVisitSchema>) => {
    if (!selectedPatient) return;

    const newVisit: Visit = {
        date: new Date().toISOString(),
        ...values,
        prescription: values.prescription.split('\n'),
    };
    const updatedPatient = { ...selectedPatient, visits: [...selectedPatient.visits, newVisit] };
    setSelectedPatient(updatedPatient);
    setPatients(prevPatients => prevPatients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    visitForm.reset();
    setIsNewOldVisitDialogOpen(false);
  };


  if (selectedPatient) {
    return (
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Patient Profile</h1>
          <Button size="sm" variant="outline" className="ml-auto" onClick={openEditPatientDialog}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Patient
          </Button>
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
                <CardDescription className="text-base">ID: {selectedPatient.id} &bull; {selectedPatient.age} years old &bull; {selectedPatient.sex}</CardDescription>
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
                    <User className="h-4 w-4 text-muted-foreground"/>
                    <span>{selectedPatient.address}</span>
                </div>
            </div>
            <Separator/>
            <div>
              <h3 className="text-xl font-semibold mb-2">Visit History</h3>
              {selectedPatient.visits.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p>No visit history found.</p>
                    <Button className="mt-4" variant="outline" onClick={() => setIsNewVisitDialogOpen(true)}>Add New Visit Record</Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                    {selectedPatient.visits.map((visit, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                            <span>{new Date(visit.date).toLocaleDateString()}</span>
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
               {selectedPatient.visits.length > 0 && (
                <div className="mt-4 flex flex-col items-center">
                    <Button variant="outline" onClick={() => setIsNewVisitDialogOpen(true)}>Add New Visit Record</Button>
                    <Button variant="link" size="sm" className="mt-2" onClick={() => setIsNewOldVisitDialogOpen(true)}>Add an old visit record?</Button>
                </div>
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
                              <h2 className="text-base font-bold text-primary">ClinicEase</h2>
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
                              <div><strong>Age:</strong> {selectedPatient.age}</div>
                              <div><strong>Sex:</strong> {selectedPatient.sex}</div>
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
        <Dialog open={isNewOldVisitDialogOpen} onOpenChange={setIsNewOldVisitDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Old Visit Record</DialogTitle>
                    <DialogDescription>Enter details for a past visit for {selectedPatient.name}.</DialogDescription>
                </DialogHeader>
                <Form {...visitForm}>
                    <form onSubmit={visitForm.handleSubmit(handleAddNewOldVisit)} className="space-y-4">
                        <FormField control={visitForm.control} name="doctor" render={({ field }) => (
                            <FormItem><FormLabel>Doctor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={visitForm.control} name="complaint" render={({ field }) => (
                            <FormItem><FormLabel>Chief Complaint</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={visitForm.control} name="diagnosis" render={({ field }) => (
                            <FormItem><FormLabel>Diagnosis</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={visitForm.control} name="prescription" render={({ field }) => (
                            <FormItem><FormLabel>Prescription (one per line)</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={visitForm.control} name="testsAdvised" render={({ field }) => (
                            <FormItem><FormLabel>Tests Advised</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={visitForm.control} name="notes" render={({ field }) => (
                            <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Save Visit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        <Dialog open={isNewVisitDialogOpen} onOpenChange={setIsNewVisitDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Visit</DialogTitle>
                <DialogDescription>Choose the type of OPD visit for {selectedPatient.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" onClick={() => handleNavigateToVisit('medical')}>
                    Medical OPD
                </Button>
                <Button onClick={() => handleNavigateToVisit('dental')}>
                    Dental OPD
                </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
            <Button onClick={() => {
                patientForm.reset({
                    name: '',
                    age: '' as any,
                    sex: 'Male',
                    email: '',
                    phone: '',
                    address: '',
                    govtId: '',
                });
                setIsNewPatientDialogOpen(true)
            }}>
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
            <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(handleAddNewPatient)} className="space-y-4">
                    <FormField control={patientForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={patientForm.control} name="age" render={({ field }) => (
                            <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={patientForm.control} name="sex" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                     <FormField control={patientForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={patientForm.control} name="govtId" render={({ field }) => (
                        <FormItem><FormLabel>Govt. ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={patientForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={patientForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
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
     <Dialog open={isEditPatientDialogOpen} onOpenChange={setIsEditPatientDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Patient</DialogTitle>
                <DialogDescription>
                   Update the patient's details.
                </DialogDescription>
            </DialogHeader>
            <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(handleUpdatePatient)} className="space-y-4">
                    <FormField control={patientForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={patientForm.control} name="age" render={({ field }) => (
                            <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={patientForm.control} name="sex" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                     <FormField control={patientForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={patientForm.control} name="govtId" render={({ field }) => (
                        <FormItem><FormLabel>Govt. ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={patientForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={patientForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
