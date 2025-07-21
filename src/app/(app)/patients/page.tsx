
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, Phone, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

type Visit = {
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
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
      { date: '2024-07-15', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Viral Fever', prescription: 'Tab. Paracetamol 500mg (1-1-1) for 3 days.' },
      { date: '2024-05-02', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Common Cold', prescription: 'Tab. Cetirizine 10mg (0-0-1) for 5 days.' },
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
      { date: '2024-06-20', doctor: 'Dr. Priya Singh', diagnosis: 'Dental Caries (#16)', prescription: 'Dental filling advised. Tab. Ketorolac DT for pain.' },
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
      { date: '2024-07-22', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Acute Gastritis', prescription: 'Syp. Digene (2 tsp SOS). Avoid spicy food.' },
      { date: '2023-11-10', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Migraine', prescription: 'Tab. Sumatriptan 50mg (SOS).' },
      { date: '2023-01-30', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Routine Checkup', prescription: 'All vitals normal. Advised multivitamins.' },
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
      { date: '2024-07-05', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Hypertension', prescription: 'Tab. Amlodipine 5mg (1-0-0). Monitor BP weekly.' },
    ],
  },
];


export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    <AccordionContent className="space-y-2 pl-2">
                      <p><strong>Doctor:</strong> {visit.doctor}</p>
                      <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                      <p><strong>Prescription:</strong> {visit.prescription}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </CardContent>
        </Card>
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

