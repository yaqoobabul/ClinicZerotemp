
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ChevronsUpDown, Check, Calendar as CalendarIcon, ZoomIn, ZoomOut } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { format, set, addMinutes, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';


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
  { id: '1', patientName: 'Aarav Patel', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine Checkup', status: 'upcoming', durationMinutes: 30 },
  { id: '2', patientName: 'Priya Singh', patientId: '2', doctorId: 'doc2', dateTime: new Date(new Date().setHours(11, 30, 0, 0)), reason: 'Follow-up', status: 'upcoming', durationMinutes: 45 },
  { id: '3', patientName: 'Rohan Gupta', patientId: '3', doctorId: 'doc1', dateTime: new Date(new Date().setHours(14, 0, 0, 0)), reason: 'Dental Cleaning', status: 'upcoming', durationMinutes: 60 },
  { id: '4', patientName: 'Saanvi Sharma', patientId: '4', doctorId: 'doc1', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Root Canal', status: 'finished', durationMinutes: 90 },
];

const START_HOUR = 8;
const END_HOUR = 21;
const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * 4 }, (_, i) => {
    const baseDate = startOfDay(new Date());
    return addMinutes(baseDate, START_HOUR * 60 + i * 15);
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
  const [zoomLevel, setZoomLevel] = useState(2);
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
      durationMinutes: values.durationMinutes || 30,
    };
    setAppointments(prev => [...prev, newAppointment]);
    closeAndResetDialog();
  };

  const handleSlotClick = (doctorId: string, time: Date) => {
    if (!selectedDate) return;
    const combinedDateTime = set(selectedDate, {
        hours: time.getHours(),
        minutes: time.getMinutes(),
        seconds: 0,
        milliseconds: 0,
    });
    setSelectedSlotInfo({ doctorId, dateTime: combinedDateTime });
    setAppointmentFlowStep('choose');
    setSelectedPatientForAppointment(null);
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
  
  const slotHeight = `${zoomLevel * 0.5 + 0.5}rem`;

  const renderAppointmentCard = (app: Appointment) => {
    const startMinutes = (app.dateTime.getHours() * 60 + app.dateTime.getMinutes()) - (START_HOUR * 60);
    const durationMinutes = app.durationMinutes || 30;
    
    const gridRowStart = (startMinutes / 15) + 1;
    const gridRowEnd = gridRowStart + (durationMinutes / 15);

    return (
      <div
        key={app.id}
        className="relative flex flex-col overflow-hidden rounded-lg p-2 text-primary-foreground shadow-md bg-primary/90 border-l-4 border-primary"
        style={{ 
            gridRow: `${gridRowStart} / ${gridRowEnd}`,
            gridColumn: 1,
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
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoomLevel(prev => Math.max(1, prev - 1))}><ZoomOut/></Button>
                    <Slider
                        value={[zoomLevel]}
                        onValueChange={(value) => setZoomLevel(value[0])}
                        min={1}
                        max={8}
                        step={1}
                        className="w-32"
                    />
                    <Button variant="outline" size="icon" onClick={() => setZoomLevel(prev => Math.min(8, prev + 1))}><ZoomIn/></Button>
                </div>
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
                            className="h-12 flex items-center justify-center p-2 text-center font-semibold border-l first:border-l-0 bg-muted"
                        >
                            <h3>{doctor.name}</h3>
                        </div>
                    ))}
                </div>

                {/* Timeline Grid */}
                <div className="col-start-1 row-start-2 border-r relative">
                    {timeSlots.map((time, index) => (
                        <div key={index} className="relative text-right" style={{ height: slotHeight }}>
                             {time.getMinutes() === 0 && (
                                <span className="text-xs text-muted-foreground absolute -top-2 right-2 bg-card px-1">{format(time, 'h a')}</span>
                             )}
                        </div>
                    ))}
                </div>
                
                <div className="col-start-2 row-start-2 grid" style={{ gridTemplateColumns: `repeat(${doctors.length}, 1fr)` }}>
                     {doctors.map(doctor => (
                        <div key={doctor.id} className="relative grid border-l first:border-l-0" style={{ gridTemplateRows: `repeat(${timeSlots.length}, ${slotHeight})` }}>
                            {timeSlots.map((time, index) => {
                                const isHour = time.getMinutes() === 0;
                                return (
                                    <button
                                        key={`${doctor.id}-${index}`}
                                        aria-label={`Book with ${doctor.name} at ${format(time, 'p')}`}
                                        onClick={() => handleSlotClick(doctor.id, time)}
                                        className={cn(
                                            "w-full transition-colors hover:bg-accent/50",
                                            isHour ? "border-t border-dashed border-border" : "border-t border-dotted border-border/75"
                                        )}
                                        style={{ height: slotHeight }}
                                    ></button>
                                );
                            })}
                             {/* Appointments */}
                            {getAppointmentsForDoctorAndDate(doctor.id, selectedDate).map(app => renderAppointmentCard(app))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

    