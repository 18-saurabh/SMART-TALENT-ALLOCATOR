import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  role: 'manager' | 'employee';
  name?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'manager' | 'employee', name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role: 'manager' | 'employee') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      // Try to get manager profile first
      const managerDoc = await getDoc(doc(db, 'managers', uid));
      if (managerDoc.exists()) {
        return managerDoc.data() as UserProfile;
      }
      
      // Try to get employee profile
      const employeeDoc = await getDoc(doc(db, 'employees', uid));
      if (employeeDoc.exists()) {
        return employeeDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async function signUp(email: string, password: string, role: 'manager' | 'employee', name?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role,
      name
    };

    await setDoc(doc(db, role === 'manager' ? 'managers' : 'employees', user.uid), profile);
    setUserProfile(profile);
  }

  async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      throw new Error('User profile not found. Please contact support.');
    }
    setUserProfile(profile);
  }

  async function signInWithGoogle(role: 'manager' | 'employee') {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user already exists
    const existingProfile = await getUserProfile(user.uid);
    
    if (existingProfile) {
      if (existingProfile.role !== role) {
        await signOut(auth);
        throw new Error(`This Google account is already registered as a ${existingProfile.role}`);
      }
      setUserProfile(existingProfile);
    } else {
      // Create new profile
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        role,
        name: user.displayName || undefined
      };
      
      await setDoc(doc(db, role === 'manager' ? 'managers' : 'employees', user.uid), profile);
      setUserProfile(profile);
    }
  }

  async function logout() {
    setUserProfile(null);
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}