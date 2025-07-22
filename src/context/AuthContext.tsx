
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// This is a mock type for demonstration. In a real app, you'd fetch users from a backend.
type StaffMember = {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  staff: StaffMember[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
  createUser: (email: string, pass: string) => Promise<any>;
  deleteStaff: (staffId: string) => void;
  sendPasswordReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // NOTE: This is a client-side mock for staff management.
  // A real application would use a secure backend to list/manage users.
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const createUser = async (email: string, pass: string) => {
    // In a real app, this would be a backend call that creates the user
    // and adds them to a 'staff' collection in a database.
    // For this demo, we'll just add them to our local state.
    const response = await createUserWithEmailAndPassword(auth, email, pass);
    const newStaffMember: StaffMember = { id: response.user.uid, email: email };
    setStaff(prevStaff => [...prevStaff, newStaffMember]);
    return response;
  };

  const deleteStaff = (staffId: string) => {
    // This is also a mock. In a real app, this would be a secure backend call
    // to delete the user from Firebase Auth and your database.
    // The client SDK cannot delete other users.
    setStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));
  }

  const sendPasswordReset = async () => {
    if (auth.currentUser?.email) {
      return sendPasswordResetEmail(auth, auth.currentUser.email);
    }
    throw new Error("No user email found to send reset link.");
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, staff, signInWithGoogle, signInWithEmail, signOut, createUser, deleteStaff, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
