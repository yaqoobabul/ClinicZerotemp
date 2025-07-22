
'use client';

import { useForm, Controller } from 'react-hook-form';
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
  age: z.coerce.number().optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  patientPhone: z.string().optional(),
  address: z.string().optional(),
  doctorId: z.string().min(1, 'A doctor must be selected.'),
  dateTime: z.date({
    required_error: 'An appointment date is required.',
  }),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)").min(1, 'An appointment time is required.'),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  reason: z.string().min(1, 'Reason for appointment is required.'),
  notes: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
});

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
      age: initialData?.age,
      sex: initialData?.sex,
      address: initialData?.address || '',
      doctorId: initialData?.doctorId || '',
      dateTime: initialData?.dateTime || new Date(),
      appointmentTime: initialData?.dateTime ? format(initialData.dateTime, 'HH:mm') : '09:00',
      durationMinutes: initialData?.durationMinutes || 30,
      reason: initialData?.reason || '',
      notes: initialData?.notes || '',
      priority: initialData?.priority || 'Medium',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof appointmentFormSchema>) => {
    try {
      const time = parse(values.appointmentTime, 'HH:mm', new Date());
      const combinedDateTime = setMinutes(setHours(values.dateTime, time.getHours()), time.getMinutes());
      
      const { appointmentTime, ...rest } = values;

      const finalValues: AppointmentFormValues = {
        ...rest,
        dateTime: combinedDateTime,
      };
      
      onSubmit(finalValues);

    } catch (error) {
       console.error("Error parsing time:", error);
       form.setError("appointmentTime", { type: "manual", message: "Invalid time format. Please use HH:mm." });
    }
  };
  
  const isEditing = !!initialData?.reason;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
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
          <>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sex" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
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
             <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
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
              <FormItem className="flex flex-col justify-end">
                <FormLabel>Appointment Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} step="900" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel>Duration (min)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} step="15" />
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
              <FormLabel>Task / Reason for Appointment</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Routine Checkup, Follow-up, Toothache..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any relevant notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Set priority" /></SelectTrigger></FormControl>
                        <SelectContent>
                           <SelectItem value="Low">Low</SelectItem>
                           <SelectItem value="Medium">Medium</SelectItem>
                           <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
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
