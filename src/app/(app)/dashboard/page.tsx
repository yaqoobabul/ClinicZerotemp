
'use client';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, isToday } from 'date-fns';
import { useClinic } from '@/context/PatientContext';


const chartData = [
  { month: 'Jan', patients: 186 },
  { month: 'Feb', patients: 305 },
  { month: 'Mar', patients: 237 },
  { month: 'Apr', patients: 273 },
  { month: 'May', patients: 209 },
  { month: 'Jun', patients: 214 },
];

export default function Dashboard() {
  const { appointments, doctors } = useClinic();
  const todaysAppointments = appointments.filter(app => isToday(app.dateTime));

  return (
    <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{todaysAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Total appointments scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{todaysAppointments.filter(a => a.status === 'upcoming').length}</div>
              <p className="text-xs text-muted-foreground">Remaining for today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clinic Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+201 since last hour</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Patient Visits</CardTitle>
              <CardDescription>Monthly patient visit trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Appointments scheduled for today.</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/appointments">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {todaysAppointments.length > 0 ? (
                todaysAppointments
                  .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                  .map(app => {
                    const doctor = doctors.find(d => d.id === app.doctorId);
                    return (
                    <div className="flex items-center gap-4" key={app.id}>
                      <Avatar className="hidden h-9 w-9 sm:flex">
                         <AvatarImage src={`https://placehold.co/40x40.png?text=${app.patientName[0]}`} alt="Avatar" data-ai-hint="person portrait"/>
                         <AvatarFallback>{app.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{app.patientName}</p>
                        <p className="text-sm text-muted-foreground">{app.reason}</p>
                        {doctor && <p className="text-xs text-muted-foreground">{doctor.name}</p>}
                      </div>
                      <div className="ml-auto font-medium text-sm text-right">
                        <div>{format(app.dateTime, 'p')}</div>
                        <Badge variant={app.status === 'finished' ? 'default' : app.status === 'cancelled' ? 'destructive' : 'secondary'} className="mt-1">{app.status}</Badge>
                      </div>
                    </div>
                  )})
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No appointments scheduled for today.</p>
                  </div>
                )
              }
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
