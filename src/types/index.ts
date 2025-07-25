

export type Visit = {
  date: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  prescription: string[];
  testsAdvised?: string;
  notes?: string;
};

export type Patient = {
  id: string;
  name: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  email: string;
  govtId: string;
  avatarUrl: string;
  visits: Visit[];
};

export type Doctor = {
  id: string;
  uid: string; // Firebase Auth User ID
  name: string;
  qualification?: string;
  registrationId?: string;
};

export type Appointment = {
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
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  address?: string;
};
