
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
  sendPasswordResetEmail,
  Auth,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const storedValue = window.localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState(() => getInitialState(key, defaultValue));

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  // NOTE: This is a client-side mock for staff management.
  // A real application would use a secure backend to list/manage users.
  const [staff, setStaff] = usePersistentState<StaffMember[]>('clinic_staff', []);
  const [deletedStaffIds, setDeletedStaffIds] = usePersistentState<string[]>('clinic_deleted_staff', []);


  const isUserDisabled = (uid: string) => deletedStaffIds.includes(uid);

  const handleSuccessfulLogin = async (userCredential: UserCredential) => {
    if (isUserDisabled(userCredential.user.uid)) {
      await firebaseSignOut(auth);
      throw new Error("This user account has been disabled.");
    }
    router.push('/dashboard');
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isUserDisabled(user.uid)) {
          await firebaseSignOut(auth);
          setUser(null);
      } else {
          setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deletedStaffIds]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(result);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await handleSuccessfulLogin(result);
    return result;
  };

  const createUser = async (email: string, pass: string) => {
    // In a real app, this would be a backend call that creates the user
    // and adds them to a 'staff' collection in a database.
    const response = await createUserWithEmailAndPassword(auth, email, pass);
    const newStaffMember: StaffMember = { id: response.user.uid, email: email };
    setStaff(prevStaff => [...prevStaff, newStaffMember]);
    return response;
  };

  const deleteStaff = (staffId: string) => {
    // Client-side can't truly delete a Firebase Auth user.
    // Instead, we remove them from the local staff list and add them
    // to a "denylist" to prevent future logins.
    setStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));
    setDeletedStaffIds(prevIds => [...new Set([...prevIds, staffId])]);
    toast({
        title: "Staff Account Removed",
        description: `The user has been removed from the list and their access has been revoked.`,
    });
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
