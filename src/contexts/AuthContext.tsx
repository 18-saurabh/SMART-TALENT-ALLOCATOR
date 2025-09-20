import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

  async function checkEmailRole(email: string): Promise<'manager' | 'employee' | null> {
    try {
      const managerQuery = await getDocs(query(collection(db, 'managers'), where('email', '==', email)));
      const employeeQuery = await getDocs(query(collection(db, 'employees'), where('email', '==', email)));
    
      if (!managerQuery.empty) return 'manager';
      if (!employeeQuery.empty) return 'employee';
      return null;
    } catch (error) {
      console.error('Error checking email role:', error);
      return null;
    }
  }

  async function signUp(email: string, password: string, role: 'manager' | 'employee', name?: string) {
    const existingRole = await checkEmailRole(email);
    if (existingRole && existingRole !== role) {
      throw new Error(`This email is already registered as a ${existingRole}`);
    }

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
    
    try {
      const role = await checkEmailRole(user.email!);
      if (!role) {
        throw new Error('User not found in our system');
      }

      const profileQuery = await getDocs(query(
        collection(db, role === 'manager' ? 'managers' : 'employees'), 
        where('email', '==', user.email!)
      ));
      
      if (!profileQuery.empty) {
        setUserProfile(profileQuery.docs[0].data() as UserProfile);
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  async function signInWithGoogle(role: 'manager' | 'employee') {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const existingRole = await checkEmailRole(user.email!);
    if (existingRole && existingRole !== role) {
      await signOut(auth);
      throw new Error(`This Google account is already registered as a ${existingRole}`);
    }

    if (!existingRole) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        role,
        name: user.displayName || undefined
      };
      
      await setDoc(doc(db, role === 'manager' ? 'managers' : 'employees', user.email!), profile);
      setUserProfile(profile);
    } else {
      const profileDoc = await getDoc(doc(db, role === 'manager' ? 'managers' : 'employees', user.email!));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile);
      }
    }
  }

  async function logout() {
    setUserProfile(null);
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await checkEmailRole(user.email!);
        if (role) {
          const profileDoc = await getDoc(doc(db, role === 'manager' ? 'managers' : 'employees', user.email!));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          }
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