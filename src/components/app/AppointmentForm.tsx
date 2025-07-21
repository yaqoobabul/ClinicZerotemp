
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Doctor = {
  id: string;
  name: string;
};

const appointmentFormSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required.'),
  patientPhone: z.string().optional(),
  doctorId: z.string().min(1, 'A doctor must be selected.'),
  dateTime: z.date({
    required_error: 'An appointment date is required.',
  }),
  appointmentTime: z.string().min(1, 'An appointment time is required.'),
  reason: z.string().min(1, 'Reason for appointment is required.'),
});

// Final submission values
export type AppointmentFormValues = Omit<z.infer<typeof appointmentFormSchema>, 'appointmentTime'>;

interface AppointmentFormProps {
  onSubmit: (values: AppointmentFormValues) => void;
  onCancel: () => void;
  doctors: Doctor[];
  initialData?: Partial<AppointmentFormValues>;
  showPatientDetails?: boolean;
}

export function AppointmentForm({ onSubmit, onCancel, doctors, initialData, showPatientDetails = false }: AppointmentFormProps) {
  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientName: initialData?.patientName || '',
      patientPhone: initialData?.patientPhone || '',
      doctorId: initialData?.doctorId || '',
      dateTime: initialData?.dateTime || new Date(),
      appointmentTime: initialData?.dateTime ? format(initialData.dateTime, 'HH:mm') : '09:00',
      reason: initialData?.reason || '',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof appointmentFormSchema>) => {
    const time = parse(values.appointmentTime, 'HH:mm', new Date());
    const combinedDateTime = setMinutes(setHours(values.dateTime, time.getHours()), time.getMinutes());

    const finalValues: AppointmentFormValues = {
      ...values,
      dateTime: combinedDateTime,
    };

    onSubmit(finalValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter patient's full name" {...field} disabled={!showPatientDetails && !!initialData?.patientName} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showPatientDetails && (
          <FormField
            control={form.control}
            name="patientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter patient's phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Assign a doctor" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {doctors.map(doc => (
                                <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />


        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Appointment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} step="900" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Appointment</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Routine Checkup, Follow-up, Toothache..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Appointment</Button>
        </div>
      </form>
    </Form>
  );
}
