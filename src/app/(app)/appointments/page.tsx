
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Clock, CheckCircle, ChevronsUpDown, Check } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  avatarUrl: string;
  dateTime: Date;
  reason: string;
  status: 'upcoming' | 'finished';
};

type Patient = {
  id: string;
  name: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
  avatarUrl: string;
}

const initialPatients: Patient[] = [
  { id: '1', name: 'Aarav Patel', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Priya Singh', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Rohan Gupta', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Saanvi Sharma', avatarUrl: 'https://placehold.co/40x40.png' },
];


const initialAppointments: Appointment[] = [
  { id: '1', patientName: 'Aarav Patel', patientId: 'CZ-12345', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() + 1)), reason: 'Routine Checkup', status: 'upcoming' },
  { id: '2', patientName: 'Priya Singh', patientId: 'CZ-67890', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() + 2)), reason: 'Follow-up', status: 'upcoming' },
  { id: '3', patientName: 'Rohan Gupta', patientId: 'CZ-54321', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Dental Cleaning', status: 'finished' },
  { id: '4', patientName: 'Saanvi Sharma', patientId: 'CZ-09876', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() - 3)), reason: 'Root Canal', status: 'finished' },
];


export default function AppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [appointmentFlowStep, setAppointmentFlowStep] = useState<'choose' | 'new' | 'existing'>('choose');
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming').sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
  const finishedAppointments = appointments.filter(a => a.status === 'finished').sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());

  const handleAddAppointment = (values: AppointmentFormValues) => {
    
    // If it's a new patient, create a new patient record first
    if (appointmentFlowStep === 'new') {
        const newPatient: Patient = {
            id: `CZ-${Date.now().toString().slice(-6)}`,
            name: values.patientName,
            age: values.age,
            sex: values.sex,
            phone: values.phone,
            address: values.address,
            avatarUrl: `https://placehold.co/40x40.png?text=${values.patientName[0]}`
        };
        setPatients(prev => [...prev, newPatient]);
    }

    const patientForAppointment = appointmentFlowStep === 'new' 
        ? { id: `CZ-${Date.now().toString().slice(-6)}`, avatarUrl: `https://placehold.co/40x40.png?text=${values.patientName[0]}` } 
        : selectedPatientForAppointment;

    if (!patientForAppointment) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No patient selected for the appointment.',
        });
        return;
    }

    const newAppointment: Appointment = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        patientName: values.patientName,
        patientId: patientForAppointment.id,
        avatarUrl: patientForAppointment.avatarUrl,
        dateTime: values.dateTime,
        reason: values.reason,
        status: 'upcoming',
    };
    setAppointments(prev => [...prev, newAppointment]);
    closeAndResetDialog();
  }

  const closeAndResetDialog = () => {
    setIsNewAppointmentDialogOpen(false);
    // Reset flow after a short delay to allow dialog to close
    setTimeout(() => {
      setAppointmentFlowStep('choose');
      setSelectedPatientForAppointment(null);
    }, 300);
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
        <Avatar>
            <AvatarImage src={appointment.avatarUrl} alt={appointment.patientName} data-ai-hint="person portrait" />
            <AvatarFallback>{appointment.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <p className="font-semibold">{appointment.patientName}</p>
            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-medium">{format(appointment.dateTime, 'PP')}</p>
            <p className="text-sm text-muted-foreground">{format(appointment.dateTime, 'p')}</p>
        </div>
    </div>
  );
  
  const PatientCombobox = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? patients.find((patient) => patient.name.toLowerCase() === value)?.name
                        : "Select patient..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search patient..." />
                    <CommandEmpty>No patient found.</CommandEmpty>
                    <CommandGroup>
                        {patients.map((patient) => (
                            <CommandItem
                                key={patient.id}
                                value={patient.name.toLowerCase()}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue);
                                    const selected = patients.find(p => p.name.toLowerCase() === currentValue);
                                    setSelectedPatientForAppointment(selected || null);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === patient.name.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {patient.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Appointments</CardTitle>
              <CardDescription>View, schedule, and manage all patient appointments.</CardDescription>
            </div>
            <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  Add Appointment
                </Button>
              </DialogTrigger>
              <DialogContent onInteractOutside={(e) => {
                    // Prevent closing dialog when clicking inside popovers
                    if ((e.target as HTMLElement).closest('[role="combobox"]')) {
                        e.preventDefault();
                    }
                }}>
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                  <DialogDescription>Is this for a new or an existing patient?</DialogDescription>
                </DialogHeader>
                {appointmentFlowStep === 'choose' && (
                    <div className='grid grid-cols-2 gap-4 pt-4'>
                        <Button variant="outline" onClick={() => setAppointmentFlowStep('new')}>New Patient</Button>
                        <Button onClick={() => setAppointmentFlowStep('existing')}>Existing Patient</Button>
                    </div>
                )}
                {appointmentFlowStep === 'new' && (
                    <AppointmentForm 
                        onSubmit={handleAddAppointment} 
                        onCancel={closeAndResetDialog}
                        showPatientDetails={true}
                    />
                )}
                {appointmentFlowStep === 'existing' && (
                    <div className="space-y-4">
                        <PatientCombobox />
                        {selectedPatientForAppointment && (
                            <AppointmentForm 
                                key={selectedPatientForAppointment.id}
                                onSubmit={handleAddAppointment} 
                                onCancel={closeAndResetDialog}
                                initialData={{ patientName: selectedPatientForAppointment.name }}
                                showPatientDetails={false}
                            />
                        )}
                    </div>
                )}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isClient ? (
                <Tabs defaultValue="upcoming">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">
                        <Clock className="mr-2 h-4 w-4"/>
                        Upcoming ({upcomingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="finished">
                        <CheckCircle className="mr-2 h-4 w-4"/>
                        Finished ({finishedAppointments.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <div className="mt-4 space-y-2">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app}/>)
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="finished">
                    <div className="mt-4 space-y-2">
                        {finishedAppointments.length > 0 ? (
                            finishedAppointments.map(app => <AppointmentCard key={app.id} appointment={app}/>)
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No finished appointments.</p>
                        )}
                    </div>
                </TabsContent>
                </Tabs>
            ) : (
                <div className="text-center text-muted-foreground py-8">Loading appointments...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 order-1 lg:order-2">
        <Card className="flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
            />
        </Card>
      </div>
    </div>
  );
}
