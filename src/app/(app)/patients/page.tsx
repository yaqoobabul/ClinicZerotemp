
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, Phone, Mail, Printer, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  email: string;
  phone: string;
  address: string;
  visits: Visit[];
};

const mockPatients: Patient[] = [
  {
    id: 'CZ-123456',
    name: 'Sneha Sharma',
    age: 34,
    gender: 'Female',
    avatarUrl: 'https://placehold.co/40x40.png',
    email: 'sneha.sharma@example.com',
    phone: '+91 98765 43210',
    address: 'A-123, Rosewood Apartments, Mumbai',
    visits: [
      { date: '2024-07-15', doctor: 'Dr. Rajesh Kumar', complaint: 'Fever and body ache', diagnosis: 'Viral Fever', prescription: ['Tab. Paracetamol 500mg (1-1-1) for 3 days.', 'Syp. Cough Syrup (2 tsp SOS)'] },
      { date: '2024-05-02', doctor: 'Dr. Rajesh Kumar', complaint: 'Runny nose and sneezing', diagnosis: 'Common Cold', prescription: ['Tab. Cetirizine 10mg (0-0-1) for 5 days.'] },
    ],
  },
  {
    id: 'CZ-654321',
    name: 'Rohan Roy',
    age: 45,
    gender: 'Male',
    avatarUrl: 'https://placehold.co/40x40.png',
    email: 'rohan.roy@example.com',
    phone: '+91 91234 56789',
    address: 'B-45, Sunshine Colony, Delhi',
    visits: [
      { date: '2024-06-20', doctor: 'Dr. Priya Singh', complaint: 'Pain in upper right tooth', diagnosis: 'Dental Caries (#16)', prescription: ['Dental filling advised.', 'Tab. Ketorolac DT for pain.'], testsAdvised: 'IOPA w.r.t #16' },
    ],
  },
  {
    id: 'CZ-789012',
    name: 'Anjali Kumari',
    age: 28,
    gender: 'Female',
    avatarUrl: 'https://placehold.co/40x40.png',
    email: 'anjali.kumari@example.com',
    phone: '+91 99887 76655',
    address: '7, Lotus Lane, Bengaluru',
    visits: [
      { date: '2024-07-22', doctor: 'Dr. Rajesh Kumar', complaint: 'Stomach pain', diagnosis: 'Acute Gastritis', prescription: ['Syp. Digene (2 tsp SOS).'], notes: 'Avoid spicy food.' },
      { date: '2023-11-10', doctor: 'Dr. Rajesh Kumar', complaint: 'Headache', diagnosis: 'Migraine', prescription: ['Tab. Sumatriptan 50mg (SOS).'] },
      { date: '2023-01-30', doctor: 'Dr. Rajesh Kumar', complaint: 'Routine checkup', diagnosis: 'Routine Checkup', prescription: ['All vitals normal. Advised multivitamins.'] },
    ],
  },
   {
    id: 'CZ-345678',
    name: 'Vikram Mehra',
    age: 52,
    gender: 'Male',
    avatarUrl: 'https://placehold.co/40x40.png',
    email: 'vikram.mehra@example.com',
    phone: '+91 87654 32109',
    address: 'Flat 501, Heritage Heights, Pune',
    visits: [
      { date: '2024-07-05', doctor: 'Dr. Rajesh Kumar', complaint: 'High BP reading at home', diagnosis: 'Hypertension', prescription: ['Tab. Amlodipine 5mg (1-0-0).'], notes: 'Monitor BP weekly.' },
    ],
  },
];


export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePrint = () => {
    // This uses the browser's print functionality
    window.print();
  };

  if (selectedPatient) {
    return (
      <div className="grid flex-1 items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedPatient(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Patient Profile</h1>
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
                    <span>{selectedPatient.email}</span>
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
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={!!viewingVisit} onOpenChange={(isOpen) => !isOpen && setViewingVisit(null)}>
          <DialogContent className="max-w-4xl p-0">
             {viewingVisit && (
                <>
                <DialogHeader className="sr-only">
                    <DialogTitle>Visit Report for {selectedPatient.name}</DialogTitle>
                    <DialogDescription>
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
                              <div><strong>ID:</strong> {selectedPatient.id}</div>
                              <div><strong>Name:</strong> {selectedPatient.name}</div>
                              <div><strong>Age/Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</div>
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
                      <div className="text-right mt-24">
                          <p className="border-t-2 border-black pt-1 font-semibold inline-block">Dr. {viewingVisit.doctor}</p>
                      </div>
                  </div>
                </div>
                </>
             )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
            <CardTitle className="text-2xl">Patient Management</CardTitle>
            <CardDescription>
                Search for patients or view their profiles and visit history.
            </CardDescription>
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
        {filteredPatients.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                <p>No patients found.</p>
            </div>
        )}
    </div>
  );
}
