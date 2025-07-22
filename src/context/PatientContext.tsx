
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient } from '@/types';

interface PatientContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const initialPatients: Patient[] = [
  { id: '1', name: 'Aarav Patel', phone: '9876543210', age: 45, sex: 'Male', address: '123 Gandhi Nagar, Mumbai', email: 'aarav.p@example.com', govtId: 'ABC12345', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Priya Singh', phone: '9876543211', age: 32, sex: 'Female', address: '456 Nehru Park, Delhi', email: 'priya.s@example.com', govtId: 'DEF67890', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Rohan Gupta', phone: '9876543212', age: 28, sex: 'Male', address: '789 Tagore Lane, Kolkata', email: 'rohan.g@example.com', govtId: 'GHI11223', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Saanvi Sharma', phone: '9876543213', age: 55, sex: 'Female', address: '101 Bose Road, Chennai', email: 'saanvi.s@example.com', govtId: 'JKL33445', visits: [], avatarUrl: 'https://placehold.co/40x40.png' },
];

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  return (
    <PatientContext.Provider value={{ patients, setPatients }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
