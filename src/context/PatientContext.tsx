
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient, Appointment, Doctor } from '@/types';
import { useAuth } from './AuthContext';

interface AppContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  updateDoctorProfile: (doctorId: string, profileData: Partial<Doctor>) => void;
  clinicName: string;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;
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
  { id: 'doc1', uid: 'G6s4K3tOr7WqLmM4xYjGo8Zk8Z52', name: 'Dr. Priya Sharma', qualification: 'MBBS, MD', registrationId: '12345' },
  { id: 'doc2', uid: 'some-other-uid', name: 'Dr. Rohan Mehra', qualification: 'BDS', registrationId: '67890' },
];


export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [clinicName, setClinicName] = useState<string>('ClinicEase');

  // When a user logs in, we associate their Firebase UID with a doctor profile.
  // For this example, we'll assign the logged-in user to 'doc1' if they are 'j@gmail.com'.
  // In a real app, you'd fetch this mapping from your database.
  React.useEffect(() => {
    if (user?.email === 'j@gmail.com') {
      setDoctors(prevDoctors => {
        const userExists = prevDoctors.some(d => d.uid === user.uid);
        if (userExists) return prevDoctors; // Prevent re-assigning on every render
        
        return prevDoctors.map(d => d.id === 'doc1' ? { ...d, uid: user.uid } : d);
      });
    }
  }, [user]);

  const updateDoctorProfile = (doctorId: string, profileData: Partial<Omit<Doctor, 'id' | 'uid'>>) => {
    setDoctors(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId ? { ...doctor, ...profileData } : doctor
      )
    );
  };

  return (
    <AppContext.Provider value={{ patients, setPatients, appointments, setAppointments, doctors, setDoctors, updateDoctorProfile, clinicName, setClinicName }}>
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
