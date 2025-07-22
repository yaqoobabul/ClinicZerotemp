
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient, Appointment, Doctor } from '@/types';

interface AppContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  doctors: Doctor[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPatients: Patient[] = [
  { id: '1', name: 'Aarav Patel', phone: '9876543210', age: 45, sex: 'Male', address: '123 Gandhi Nagar, Mumbai', email: 'aarav.p@example.com', govtId: 'ABC12345', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Priya Singh', phone: '9876543211', age: 32, sex: 'Female', address: '456 Nehru Park, Delhi', email: 'priya.s@example.com', govtId: 'DEF67890', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Rohan Gupta', phone: '9876543212', age: 28, sex: 'Male', address: '789 Tagore Lane, Kolkata', email: 'rohan.g@example.com', govtId: 'GHI11223', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Saanvi Sharma', phone: '9876543213', age: 55, sex: 'Female', address: '101 Bose Road, Chennai', email: 'saanvi.s@example.com', govtId: 'JKL33445', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
];

const initialAppointments: Appointment[] = [
  { id: '1', patientName: 'Aarav Patel', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 0, 0, 0)), reason: 'Routine Checkup', status: 'upcoming', durationMinutes: 30, priority: 'Medium' },
  { id: '5', patientName: 'Ishaan Verma', patientId: '1', doctorId: 'doc1', dateTime: new Date(new Date().setHours(10, 30, 0, 0)), reason: 'Consultation', status: 'upcoming', durationMinutes: 30, priority: 'Medium' },
  { id: '2', patientName: 'Priya Singh', patientId: '2', doctorId: 'doc1', dateTime: new Date(new Date().setHours(11, 30, 0, 0)), reason: 'Follow-up', status: 'upcoming', durationMinutes: 45, priority: 'High' },
  { id: '3', patientName: 'Rohan Gupta', patientId: '3', doctorId: 'doc2', dateTime: new Date(new Date().setHours(14, 0, 0, 0)), reason: 'Dental Cleaning', status: 'upcoming', durationMinutes: 60, priority: 'Low' },
  { id: '4', patientName: 'Saanvi Sharma', patientId: '4', doctorId: 'doc1', dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), reason: 'Root Canal', status: 'finished', durationMinutes: 90, priority: 'High' },
];

const initialDoctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. Priya Sharma' },
  { id: 'doc2', name: 'Dr. Rohan Mehra' },
];


export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [doctors] = useState<Doctor[]>(initialDoctors);

  return (
    <AppContext.Provider value={{ patients, setPatients, appointments, setAppointments, doctors }}>
      {children}
    </AppContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a PatientProvider');
  }
  return context;
};
