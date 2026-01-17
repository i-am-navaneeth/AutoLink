'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { RideRequest } from '@/lib/types';

/* ================= TYPES ================= */

export type UserType = 'passenger' | 'pilot' | 'admin' | null;
export type PilotVerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | null;

interface UserContextType {
  user: User | null;
  userType: UserType;
  loading: boolean;

  pilotVerificationStatus: PilotVerificationStatus;

  setUserType: (userType: UserType) => void;
  logout: () => Promise<void>;

  isSearching: boolean;
  setIsSearching: (v: boolean) => void;

  isRideLive: boolean;
  setIsRideLive: (v: boolean) => void;

  isQuickRideLive: boolean;
  setIsQuickRideLive: (v: boolean) => void;

  passengerCount: number;
  setPassengerCount: (v: number) => void;

  quickRideRequest: RideRequest | null;
  setQuickRideRequest: (v: RideRequest | null) => void;
}

/* ================= CONTEXT ================= */

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  /* ---------- Core auth state ---------- */
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [pilotVerificationStatus, setPilotVerificationStatus] =
    useState<PilotVerificationStatus>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Ride state ---------- */
  const [isSearching, setIsSearching] = useState(false);
  const [isRideLive, setIsRideLive] = useState(false);
  const [isQuickRideLive, setIsQuickRideLive] = useState(false);
  const [passengerCount, setPassengerCount] = useState(0);
  const [quickRideRequest, setQuickRideRequest] =
    useState<RideRequest | null>(null);

  const mountedRef = useRef(true);

  /* ---------- Load base role + pilot capability ---------- */
  const loadUserMeta = async (authUser: User) => {
    /* Base identity (always passenger unless admin) */
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (!mountedRef.current) return;

    const role: UserType = userRow?.role ?? 'passenger';
    setUserType(role);

    /* Pilot capability is independent of role */
    const { data: pilotRow } = await supabase
      .from('pilots')
      .select('verification_status')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!mountedRef.current) return;

    setPilotVerificationStatus(
      pilotRow?.verification_status ?? null
    );
  };

  /* ---------- Bootstrap + auth listener ---------- */
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await loadUserMeta(sessionUser);
      } else {
        setUserType(null);
        setPilotVerificationStatus(null);
      }

      if (!mountedRef.current) return;
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          await loadUserMeta(sessionUser);
        } else {
          setUserType(null);
          setPilotVerificationStatus(null);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------- Logout (state only) ---------- */
  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setUserType(null);
    setPilotVerificationStatus(null);

    setIsSearching(false);
    setIsRideLive(false);
    setIsQuickRideLive(false);
    setPassengerCount(0);
    setQuickRideRequest(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userType,
        pilotVerificationStatus,
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

/* ================= HOOK ================= */

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
