'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { RideRequest } from '@/lib/types';

export type UserType = 'passenger' | 'pilot' | 'admin' | null;

interface UserContextType {
  user: User | null;
  userType: UserType;
  loading: boolean;

  setUserType: (userType: UserType) => void;
  logout: () => Promise<void>;

  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;

  isRideLive: boolean;
  setIsRideLive: (isRideLive: boolean) => void;

  isQuickRideLive: boolean;
  setIsQuickRideLive: (isQuickRideLive: boolean) => void;

  passengerCount: number;
  setPassengerCount: (count: number) => void;

  quickRideRequest: RideRequest | null;
  setQuickRideRequest: (request: RideRequest | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // 🔐 Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  // 🚕 Ride state (kept from your original code)
  const [isSearching, setIsSearching] = useState(false);
  const [isRideLive, setIsRideLive] = useState(false);
  const [isQuickRideLive, setIsQuickRideLive] = useState(false);
  const [passengerCount, setPassengerCount] = useState(0);
  const [quickRideRequest, setQuickRideRequest] =
    useState<RideRequest | null>(null);

  // ✅ Fetch user role from Supabase `users` table
  const loadUserRole = async (authUser: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
  console.error('Failed to fetch user role:', error.message);
  setUserType('passenger');
  return;
}

if (!data) {
  // user row not created yet
  setUserType('passenger');
  return;
}

setUserType(data.role);

  };

  // 🔁 Initial session + auth listener
  useEffect(() => {
    // 1️⃣ Initial session
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await loadUserRole(sessionUser);
      } else {
        setUserType(null);
      }

      setLoading(false);
    });

    // 2️⃣ Auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          await loadUserRole(sessionUser);
        } else {
          setUserType(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // 🔓 Logout (Supabase)
  const logout = async () => {
    await supabase.auth.signOut();

    // reset app state
    setUser(null);
    setUserType(null);
    setIsSearching(false);
    setIsRideLive(false);
    setIsQuickRideLive(false);
    setPassengerCount(0);
    setQuickRideRequest(null);

    router.push('/login');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userType,
        loading,

        setUserType,
        logout,

        isSearching,
        setIsSearching,

        isRideLive,
        setIsRideLive,

        isQuickRideLive,
        setIsQuickRideLive,

        passengerCount,
        setPassengerCount,

        quickRideRequest,
        setQuickRideRequest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
