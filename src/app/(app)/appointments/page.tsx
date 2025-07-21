
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ChevronsUpDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { format, set } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Doctor = {
  id: string;
  name: string;
  color: string;
  colorDark: string;
};

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  reason: string;
  status: 'upcoming' | 'finished' | 'cancelled';
  durationMinutes: number;
};

type Patient = {
  id: string;
  name: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
};

type SelectedSlotInfo = {
    doctorId: string;
    dateTime: Date;
} | null;

const initialDoctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Priya Sharma', color: 'hsl(var(--chart-1))', colorDark: 'hsl(var(--chart-1))' },
  { id: 'doc2', name: 'Dr. Rohan Mehra', color: 'hsl(var(--chart-2))', colorDark: 'hsl(var(--chart-2))' },
];

const initialPatients: Patient[] = [
  { id: '1', name: 'Aarav Patel', phone: '9876543210' },
  { id: '2', name: 'Priya Singh', phone: '9876543211' },
  { id: '3', name: 'Rohan Gupta', phone: '9876543212' },
  { id: '4', name: 'Saanvi Sharma', phone: '9876543213' },
];

const initialAppointments: Appointment[] = [
  { id: '1', patientName: 'Aarav Patel', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine Checkup', status: 'upcoming', durationMinutes: 30 },
  { id: '2', patientName: 'Priya Singh', patientId: '2', doctorId: 'doc2', dateTime: new Date(new Date().setHours(11, 30, 0, 0)), reason: 'Follow-up', status: 'upcoming', durationMinutes: 30 },
  { id: '3', patientName: 'Rohan Gupta', patientId: '3', doctorId: 'doc1', dateTime: new Date(new Date().setHours(14, 0, 0, 0)), reason: 'Dental Cleaning', status: 'upcoming', durationMinutes: 60 },
  { id: '4', patientName: 'Saanvi Sharma', patientId: '4', doctorId: 'doc1', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Root Canal', status: 'finished', durationMinutes: 90 },
];

const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
});

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [doctors] = useState<Doctor[]>(initialDoctors);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [appointmentFlowStep, setAppointmentFlowStep] = useState<'choose' | 'new' | 'existing'>('choose');
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const handleAddAppointment = (values: AppointmentFormValues) => {
    let patientId = selectedPatientForAppointment?.id;

    if (appointmentFlowStep === 'new') {
      const newPatient: Patient = {
        id: `P-${Date.now().toString().slice(-6)}`,
        name: values.patientName,
        phone: values.patientPhone,
        age: values.age,
        sex: values.sex,
        address: values.address,
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
      durationMinutes: 30, // Default duration
    };
    setAppointments(prev => [...prev, newAppointment]);
    closeAndResetDialog();
  };

  const handleSlotClick = (doctorId: string, time: Date) => {
    const combinedDateTime = set(selectedDate || new Date(), {
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: 0,
        milliseconds: 0,
    });
    setSelectedSlotInfo({ doctorId, dateTime: combinedDateTime });
    setIsNewAppointmentDialogOpen(true);
  };

  const closeAndResetDialog = () => {
    setIsNewAppointmentDialogOpen(false);
    setTimeout(() => {
      setAppointmentFlowStep('choose');
      setSelectedPatientForAppointment(null);
      setSelectedSlotInfo(null);
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

  const getAppointmentsForDoctorAndDate = (doctorId: string, date: Date | null) => {
    if (!date) return [];
    return appointments.filter(app => {
      return app.doctorId === doctorId && format(app.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const renderAppointmentCard = (app: Appointment, doctorColor: string) => {
    const startMinutes = app.dateTime.getHours() * 60 + app.dateTime.getMinutes();
    const durationMinutes = app.durationMinutes || 30;
    
    // Each 30-minute slot is a row, so 2 rows per hour. Grid rows are 1-indexed.
    const gridRowStart = (startMinutes / 30) + 1;
    const gridRowEnd = gridRowStart + (durationMinutes / 30);

    return (
      <div
        key={app.id}
        className="relative flex flex-col overflow-hidden rounded-lg p-2 text-white shadow-md"
        style={{ 
            gridRow: `${gridRowStart} / ${gridRowEnd}`,
            backgroundColor: doctorColor,
        }}
      >
        <p className="font-semibold text-sm">{app.patientName}</p>
        <p className="text-xs opacity-90">{format(app.dateTime, 'p')}</p>
        <p className="text-xs opacity-90 truncate mt-1">{app.reason}</p>
      </div>
    );
  };
  
  if (!selectedDate) {
    return null; // Or a loading indicator
  }

  const getDialogInitialData = () => {
    if (selectedSlotInfo) {
      return {
        doctorId: selectedSlotInfo.doctorId,
        dateTime: selectedSlotInfo.dateTime,
        patientName: selectedPatientForAppointment?.name || '',
      };
    }
    if (selectedPatientForAppointment) {
      return { patientName: selectedPatientForAppointment.name };
    }
    return {};
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <header className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{format(selectedDate, 'PPP')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSlotInfo(null)}>
                  <PlusCircle className="mr-2" />
                  Add Appointment
                </Button>
              </DialogTrigger>
              <DialogContent onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[cmdk-root], [data-radix-popper-content-wrapper]')) {
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
                        initialData={getDialogInitialData()}
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
                                initialData={getDialogInitialData()}
                                showPatientDetails={false}
                            />
                        )}
                    </div>
                )}
              </DialogContent>
            </Dialog>
        </header>

        <div className="flex-grow overflow-auto rounded-lg border bg-card">
            <div className="grid h-full" style={{ gridTemplateColumns: 'auto 1fr' }}>
                {/* Headers */}
                <div className="sticky top-0 z-10 bg-card border-b border-r">
                    <div className="h-12 flex items-center justify-center p-2 text-sm font-semibold text-muted-foreground">Time</div>
                </div>
                <div className="sticky top-0 z-10 bg-card border-b grid" style={{ gridTemplateColumns: `repeat(${doctors.length}, 1fr)` }}>
                    {doctors.map(doctor => (
                        <div 
                            key={doctor.id} 
                            className="h-12 flex items-center justify-center p-2 text-center font-semibold border-l first:border-l-0 text-white"
                            style={{ backgroundColor: doctor.color }}
                        >
                            <h3>{doctor.name}</h3>
                        </div>
                    ))}
                </div>

                {/* Timeline Grid */}
                <div className="col-start-1 row-start-2 border-r">
                    {timeSlots.map((time, index) => (
                        (time.getMinutes() === 0) &&
                        <div key={index} className="h-16 flex justify-end pr-2 relative -top-3">
                            <span className="text-xs text-muted-foreground bg-card px-1">{format(time, 'h a')}</span>
                        </div>
                    ))}
                </div>

                <div className="col-start-2 row-start-2 grid" style={{ gridTemplateColumns: `repeat(${doctors.length}, 1fr)`, gridTemplateRows: `repeat(48, 2rem)` }}>
                    {/* Background Grid & Appointments */}
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="relative grid grid-flow-row border-l first:border-l-0" style={{ gridTemplateRows: 'repeat(48, 2rem)' }}>
                            {/* Background Lines / Clickable slots */}
                            {timeSlots.map((time, index) => (
                                <button 
                                    key={index} 
                                    aria-label={`Book appointment with ${doctor.name} at ${format(time, 'p')}`}
                                    onClick={() => handleSlotClick(doctor.id, time)}
                                    className={cn(
                                        "h-8 border-b text-left transition-colors", 
                                        index % 2 !== 0 && "border-dashed border-border/50",
                                        `hover:bg-[${doctor.color}]/20`
                                    )}
                                ></button>
                            ))}
                             {/* Appointments */}
                            {getAppointmentsForDoctorAndDate(doctor.id, selectedDate).map(app => renderAppointmentCard(app, doctor.color))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
