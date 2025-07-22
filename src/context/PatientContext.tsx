
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    if (typeof window === 'undefined') {
        return initialDoctors;
    }
    try {
        const storedDoctors = window.localStorage.getItem('clinic_doctors');
        return storedDoctors ? JSON.parse(storedDoctors) : initialDoctors;
    } catch (error) {
        console.error("Error reading doctors from localStorage", error);
        return initialDoctors;
    }
  });

  const [clinicName, setClinicName] = useState<string>(() => {
      if (typeof window === 'undefined') {
        return 'ClinicEase';
      }
      try {
        const storedName = window.localStorage.getItem('clinic_name');
        return storedName || 'ClinicEase';
      } catch (error) {
        console.error("Error reading clinic name from localStorage", error);
        return 'ClinicEase';
      }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem('clinic_name', clinicName);
    } catch (error) {
        console.error("Error saving clinic name to localStorage", error);
    }
  }, [clinicName]);

  useEffect(() => {
    try {
        window.localStorage.setItem('clinic_doctors', JSON.stringify(doctors));
    } catch (error) {
        console.error("Error saving doctors to localStorage", error);
    }
  }, [doctors]);


  // When a user logs in, we associate their Firebase UID with a doctor profile.
  // For this example, we'll assign the logged-in user to 'doc1' if they are 'j@gmail.com'.
  // In a real app, you'd fetch this mapping from your database.
  useEffect(() => {
    if (user?.email === 'j@gmail.com') {
        const userIsMapped = doctors.some(d => d.uid === user.uid);
        if (!userIsMapped) {
            setDoctors(prevDoctors => {
                const userDocIndex = prevDoctors.findIndex(d => d.id === 'doc1');
                if (userDocIndex !== -1) {
                    const newDoctors = [...prevDoctors];
                    newDoctors[userDocIndex] = { ...newDoctors[userDocIndex], uid: user.uid };
                    return newDoctors;
                }
                return prevDoctors;
            });
        }
    }
  }, [user, doctors]);

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
