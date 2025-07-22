
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ChevronsUpDown, Check, Calendar as CalendarIcon, Edit, Plus } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { format, set, getHours } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


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
  notes?: string;
  priority?: 'High' | 'Medium' | 'Low';
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
  { id: '1', patientName: 'Aarav Patel', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine Checkup', status: 'upcoming', durationMinutes: 30, priority: 'Medium' },
  { id: '5', patientName: 'Ishaan Verma', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 30, 0, 0)), reason: 'Consultation', status: 'upcoming', durationMinutes: 30, priority: 'Medium' },
  { id: '2', patientName: 'Priya Singh', patientId: '2', doctorId: 'doc1', dateTime: new Date(new Date().setHours(11, 30, 0, 0)), reason: 'Follow-up', status: 'upcoming', durationMinutes: 45, priority: 'High' },
  { id: '3', patientName: 'Rohan Gupta', patientId: '3', doctorId: 'doc2', dateTime: new Date(new Date().setHours(14, 0, 0, 0)), reason: 'Dental Cleaning', status: 'upcoming', durationMinutes: 60, priority: 'Low' },
  { id: '4', patientName: 'Saanvi Sharma', patientId: '4', doctorId: 'doc1', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Root Canal', status: 'finished', durationMinutes: 90, priority: 'High' },
];

const START_HOUR = 0;
const END_HOUR = 24;

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [doctors] = useState<Doctor[]>(initialDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctors[0]?.id || '');
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [appointmentFlowStep, setAppointmentFlowStep] = useState<'choose' | 'new' | 'existing'>('choose');
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);
  
  const hourlySlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
    return i + START_HOUR;
  });

  const handleAddOrUpdateAppointment = (values: AppointmentFormValues) => {
    if (editingAppointment) {
      // Update existing appointment
      const updatedAppointment: Appointment = {
        ...editingAppointment,
        ...values,
      };
      setAppointments(prev => prev.map(app => app.id === editingAppointment.id ? updatedAppointment : app).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()));
      toast({ title: 'Appointment Updated', description: `Appointment for ${values.patientName} has been updated.` });
    } else {
      // Add new appointment
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
        toast({ variant: 'destructive', title: 'Error', description: 'Patient and Doctor are required.' });
        return;
      }
      
      const newAppointment: Appointment = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        patientName: values.patientName,
        patientId: patientId,
        ...values,
        status: 'upcoming',
      };
      setAppointments(prev => [...prev, newAppointment].sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()));
      toast({ title: 'Appointment Created', description: `New appointment for ${values.patientName} at ${format(values.dateTime, 'p')}.` });
    }
    
    closeAndResetDialog();
  };

  const handleSlotClick = (hour: number) => {
    if (!selectedDate || !selectedDoctorId) return;
    const combinedDateTime = set(selectedDate, {
        hours: hour,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
    });
    setSelectedSlotInfo({ doctorId: selectedDoctorId, dateTime: combinedDateTime });
    setAppointmentFlowStep('choose');
    setSelectedPatientForAppointment(null);
    setEditingAppointment(null);
    setIsNewAppointmentDialogOpen(true);
  };
  
  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsNewAppointmentDialogOpen(true);
  };

  const closeAndResetDialog = () => {
    setIsNewAppointmentDialogOpen(false);
    setTimeout(() => {
      setAppointmentFlowStep('choose');
      setSelectedPatientForAppointment(null);
      setSelectedSlotInfo(null);
      setEditingAppointment(null);
    }, 300);
  };

  const PatientCombobox = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(selectedPatientForAppointment?.name.toLowerCase() || '');
    
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

  const getAppointmentsForSelectedDoctorAndDate = () => {
    if (!selectedDate || !selectedDoctorId) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return appointments.filter(app => {
      return app.doctorId === selectedDoctorId && format(app.dateTime, 'yyyy-MM-dd') === dateStr;
    });
  };

  const getPriorityBadgeVariant = (priority?: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };
  
  const date = selectedDate;
  if (!date) {
    return null; // Or a loading indicator
  }
  
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const getDialogInitialData = (): Partial<AppointmentFormValues> => {
    if (editingAppointment) {
        const patient = patients.find(p => p.id === editingAppointment.patientId);
        return { 
            ...editingAppointment,
            patientPhone: patient?.phone,
            age: patient?.age,
            sex: patient?.sex,
            address: patient?.address,
        };
    }
    if (selectedSlotInfo) {
      return {
        doctorId: selectedSlotInfo.doctorId,
        dateTime: selectedSlotInfo.dateTime,
        patientName: selectedPatientForAppointment?.name || '',
      };
    }
    if (selectedPatientForAppointment) {
      return { 
        patientName: selectedPatientForAppointment.name,
        patientPhone: selectedPatientForAppointment.phone,
        age: selectedPatientForAppointment.age,
        sex: selectedPatientForAppointment.sex,
        address: selectedPatientForAppointment.address,
        doctorId: selectedDoctorId
      };
    }
    return { doctorId: selectedDoctorId };
  };
  
  const appointmentsForDay = getAppointmentsForSelectedDoctorAndDate();
  const appointmentsByHour = appointmentsForDay.reduce((acc, app) => {
    const hour = getHours(app.dateTime);
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(app);
    return acc;
  }, {} as Record<number, Appointment[]>);

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between pb-4 gap-4 flex-wrap border-b mb-4">
            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{format(date, 'PPP')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                    </PopoverContent>
                </Popover>

                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                        {doctors.map(doctor => (
                            <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <Dialog open={isNewAppointmentDialogOpen} onOpenChange={(isOpen) => !isOpen && closeAndResetDialog()}>
              <DialogTrigger asChild>
                 <Button>
                   <PlusCircle className="mr-2" />
                   Add Appointment
                 </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" onInteractOutside={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('[cmdk-root], [data-radix-popper-content-wrapper]')) {
                      e.preventDefault();
                  }
              }}>
                <DialogHeader>
                  <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
                  {!editingAppointment && (
                    <DialogDescription>Is this for a new or an existing patient?</DialogDescription>
                  )}
                </DialogHeader>

                {editingAppointment ? (
                   <AppointmentForm
                        key={editingAppointment.id}
                        onSubmit={handleAddOrUpdateAppointment}
                        onCancel={closeAndResetDialog}
                        doctors={doctors}
                        initialData={getDialogInitialData()}
                        showPatientDetails={false}
                    />
                ) : (
                  <>
                  {appointmentFlowStep === 'choose' && (
                      <div className='grid grid-cols-2 gap-4 pt-4'>
                          <Button variant="outline" onClick={() => setAppointmentFlowStep('new')}>New Patient</Button>
                          <Button onClick={() => setAppointmentFlowStep('existing')}>Existing Patient</Button>
                      </div>
                  )}
                  {appointmentFlowStep === 'new' && (
                      <AppointmentForm
                          onSubmit={handleAddOrUpdateAppointment}
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
                                  onSubmit={handleAddOrUpdateAppointment}
                                  onCancel={closeAndResetDialog}
                                  doctors={doctors}
                                  initialData={getDialogInitialData()}
                                  showPatientDetails={false}
                              />
                          )}
                      </div>
                  )}
                  </>
                )}
              </DialogContent>
            </Dialog>
        </header>

        <div className="flex-grow overflow-y-auto rounded-lg bg-card">
          <div className="p-2 bg-primary/10 rounded-t-lg">
             <h2 className="text-xl font-bold text-center text-primary">Daily Schedule for {selectedDoctor?.name}</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 text-center">Time</TableHead>
                <TableHead>Patient / Task</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24 text-center">Priority</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hourlySlots.map(hour => {
                const appointmentsInHour = appointmentsByHour[hour] || [];
                const rowCount = Math.max(1, appointmentsInHour.length); // Ensure at least one row per hour

                return Array.from({ length: rowCount }).map((_, index) => {
                  const app = appointmentsInHour[index];

                  if (app) {
                    // Row for an existing appointment
                    return (
                      <TableRow key={app.id}>
                        {index === 0 && (
                          <TableCell rowSpan={rowCount} className="font-semibold align-top text-center border-r">
                           <div className="flex flex-col items-center gap-2">
                             <span>{format(set(new Date(), { hours: hour, minutes: 0 }), 'h aa')}</span>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSlotClick(hour)}>
                               <Plus className="h-4 w-4" />
                             </Button>
                           </div>
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {app.patientName} 
                          <span className="text-muted-foreground block text-sm font-normal">
                            {format(app.dateTime, 'p')} &bull; {app.reason}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{app.notes}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getPriorityBadgeVariant(app.priority)}>{app.priority || 'N/A'}</Badge>
                        </TableCell>
                         <TableCell className="text-center">
                           <Badge variant={app.status === 'finished' ? 'default' : app.status === 'cancelled' ? 'destructive' : 'secondary'}>{app.status}</Badge>
                        </TableCell>
                         <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(app)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // Row for an empty hour slot
                  return (
                    <TableRow key={`empty-${hour}`} className="h-14 hover:bg-muted/50 transition-colors">
                      <TableCell className="font-semibold align-top text-center border-r">
                         <div className="flex flex-col items-center gap-2">
                             <span>{format(set(new Date(), { hours: hour, minutes: 0 }), 'h aa')}</span>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSlotClick(hour)}>
                               <Plus className="h-4 w-4" />
                             </Button>
                           </div>
                      </TableCell>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        No appointments
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
