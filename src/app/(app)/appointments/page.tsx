
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Clock, CheckCircle } from 'lucide-react';
import { AppointmentForm, AppointmentFormValues } from '@/components/app/AppointmentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  avatarUrl: string;
  dateTime: Date;
  reason: string;
  status: 'upcoming' | 'finished';
};

const initialAppointments: Appointment[] = [
  { id: '1', patientName: 'Aarav Patel', patientId: 'CZ-12345', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() + 1)), reason: 'Routine Checkup', status: 'upcoming' },
  { id: '2', patientName: 'Priya Singh', patientId: 'CZ-67890', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() + 2)), reason: 'Follow-up', status: 'upcoming' },
  { id: '3', patientName: 'Rohan Gupta', patientId: 'CZ-54321', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Dental Cleaning', status: 'finished' },
  { id: '4', patientName: 'Saanvi Sharma', patientId: 'CZ-09876', avatarUrl: 'https://placehold.co/40x40.png', dateTime: new Date(new Date().setDate(new Date().getDate() - 3)), reason: 'Root Canal', status: 'finished' },
];


export default function AppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming').sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
  const finishedAppointments = appointments.filter(a => a.status === 'finished').sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());

  const handleAddAppointment = (values: AppointmentFormValues) => {
    const newAppointment: Appointment = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        patientName: values.patientName,
        patientId: 'CZ-New',
        avatarUrl: `https://placehold.co/40x40.png?text=${values.patientName[0]}`,
        dateTime: values.dateTime,
        reason: values.reason,
        status: 'upcoming',
    };
    setAppointments(prev => [...prev, newAppointment]);
    setIsNewAppointmentDialogOpen(false);
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                  <DialogDescription>Fill in the details to schedule a new appointment.</DialogDescription>
                </DialogHeader>
                <AppointmentForm onSubmit={handleAddAppointment} onCancel={() => setIsNewAppointmentDialogOpen(false)} />
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
