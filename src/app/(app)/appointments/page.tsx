
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ChevronsUpDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Doctor = {
  id: string;
  name: string;
};

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  reason: string;
  status: 'upcoming' | 'finished' | 'cancelled';
};

type Patient = {
  id: string;
  name: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
};

const initialDoctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Priya Sharma' },
  { id: 'doc2', name: 'Dr. Rohan Mehra' },
];

const initialPatients: Patient[] = [
  { id: '1', name: 'Aarav Patel', phone: '9876543210' },
  { id: '2', name: 'Priya Singh', phone: '9876543211' },
  { id: '3', name: 'Rohan Gupta', phone: '9876543212' },
  { id: '4', name: 'Saanvi Sharma', phone: '9876543213' },
];

const initialAppointments: Appointment[] = [
  { id: '1', patientName: 'Aarav Patel', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine Checkup', status: 'upcoming' },
  { id: '2', patientName: 'Priya Singh', patientId: '2', doctorId: 'doc2', dateTime: new Date(new Date().setHours(11, 30, 0, 0)), reason: 'Follow-up', status: 'upcoming' },
  { id: '3', patientName: 'Rohan Gupta', patientId: '3', doctorId: 'doc1', dateTime: new Date(new Date().setHours(14, 0, 0, 0)), reason: 'Dental Cleaning', status: 'upcoming' },
  { id: '4', patientName: 'Saanvi Sharma', patientId: '4', doctorId: 'doc1', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Root Canal', status: 'finished' },
];


// Generate time slots from 8 AM to 10 PM
const timeSlots = Array.from({ length: (22 - 8) * 2 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [doctors] = useState<Doctor[]>(initialDoctors);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [appointmentFlowStep, setAppointmentFlowStep] = useState<'choose' | 'new' | 'existing'>('choose');
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const { toast } = useToast();

  const handleAddAppointment = (values: AppointmentFormValues) => {
    let patientId = selectedPatientForAppointment?.id;

    if (appointmentFlowStep === 'new') {
      const newPatient: Patient = {
        id: `P-${Date.now().toString().slice(-6)}`,
        name: values.patientName,
        phone: values.patientPhone,
      };
      setPatients(prev => [...prev, newPatient]);
      patientId = newPatient.id;
    }

    if (!patientId || !values.doctorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Patient and Doctor are required.',
      });
      return;
    }
    
    const newAppointment: Appointment = {
      id: `APP-${Date.now().toString().slice(-6)}`,
      patientName: values.patientName,
      patientId: patientId,
      doctorId: values.doctorId,
      dateTime: values.dateTime,
      reason: values.reason,
      status: 'upcoming',
    };
    setAppointments(prev => [...prev, newAppointment]);
    closeAndResetDialog();
  };

  const closeAndResetDialog = () => {
    setIsNewAppointmentDialogOpen(false);
    setTimeout(() => {
      setAppointmentFlowStep('choose');
      setSelectedPatientForAppointment(null);
    }, 300);
  };

  const PatientCombobox = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value ? patients.find((p) => p.name.toLowerCase() === value)?.name : "Select patient..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search patient by name or phone..." />
            <CommandEmpty>No patient found.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name.toLowerCase()}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    const selected = patients.find(p => p.name.toLowerCase() === currentValue);
                    setSelectedPatientForAppointment(selected || null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === patient.name.toLowerCase() ? "opacity-100" : "opacity-0")} />
                  {patient.name} <span className="text-xs text-muted-foreground ml-2">{patient.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const getAppointmentsForDoctorAndDate = (doctorId: string, date: Date) => {
    return appointments.filter(app => {
      return app.doctorId === doctorId && format(app.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const renderAppointmentCard = (app: Appointment) => {
    const top = (app.dateTime.getHours() - 8) * 60 + app.dateTime.getMinutes();
    const duration = 30; // Assuming 30 minute slots for now

    return (
      <div
        key={app.id}
        className="absolute w-full p-2 rounded-lg bg-red-100 border border-red-300 shadow-sm"
        style={{ top: `${(top / (14 * 60)) * 100}%`, height: `${(duration / (14 * 60)) * 100}%` }}
      >
        <p className="font-semibold text-sm text-red-800">{app.patientName}</p>
        <p className="text-xs text-red-600">{format(app.dateTime, 'p')}</p>
        <p className="text-xs text-red-600 truncate">{app.reason}</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <header className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <CalendarIcon className="mr-2" />
                            <span>{format(selectedDate, 'PPP')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                    </PopoverContent>
                </Popover>
                {/* Placeholder for Doctor Filter Dropdown */}
            </div>
            <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  Add Appointment
                </Button>
              </DialogTrigger>
              <DialogContent onInteractOutside={(e) => {
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
                        doctors={doctors}
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
                                doctors={doctors}
                                initialData={{ patientName: selectedPatientForAppointment.name }}
                                showPatientDetails={false}
                            />
                        )}
                    </div>
                )}
              </DialogContent>
            </Dialog>
        </header>

        <div className="flex-grow overflow-auto border rounded-lg bg-card">
            <div className="flex h-full">
                {/* Time Gutter */}
                <div className="w-16 text-center border-r">
                    {timeSlots.map(time => (
                        <div key={time} className="h-16 flex items-center justify-center border-b">
                            <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                    ))}
                </div>

                {/* Doctor Columns */}
                <div className="flex flex-grow">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="flex-1 border-r last:border-r-0">
                            <div className="sticky top-0 bg-card p-2 text-center border-b z-10">
                                <h3 className="font-semibold">{doctor.name}</h3>
                            </div>
                            <div className="relative h-full">
                                {/* Background time slots */}
                                {timeSlots.map(time => (
                                    <div key={time} className="h-16 border-b bg-green-50/50"></div>
                                ))}
                                {/* Appointments */}
                                {getAppointmentsForDoctorAndDate(doctor.id, selectedDate).map(renderAppointmentCard)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
