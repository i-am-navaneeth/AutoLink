// src/context/user-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: 'passenger' | 'pilot' | 'admin' | string | null;
};

type UserContextValue = {
  supabaseUser: any | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  isSearching: boolean;
  setIsSearching: (v: boolean) => void;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // helper to load the app user row from "users" table
  const loadAppUser = async (id: string) => {
    try {
      const { data, error: e } = await supabase
        .from<AppUser>('users')
        .select('*')
        .eq('id', id)
        .single();
      if (e) {
        console.warn('Could not load app user row', e);
        setAppUser(null);
        return null;
      } else {
        setAppUser(data ?? null);
        return data ?? null;
      }
    } catch (err: any) {
      console.error('loadAppUser error', err);
      setAppUser(null);
      setError(String(err?.message ?? err));
      return null;
    }
  };

  // Helper to perform role-based redirect
  const redirectByRole = (u: AppUser | null) => {
    if (!u || !u.role) {
      // default landing for unknown roles
      router.push('/');
      return;
    }
    switch (u.role) {
      case 'pilot':
        router.push('/pilot-dashboard');
        break;
      case 'passenger':
        router.push('/quick-rides');
        break;
      case 'admin':
        router.push('/admin/verify-pilots');
        break;
      default:
        router.push('/');
        break;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user ?? null;
        if (!mounted) return;
        setSupabaseUser(user);
        if (user) {
          const loaded = await loadAppUser(user.id);
          // If a user row exists, optionally redirect after initial load
          if (loaded) redirectByRole(loaded);
        } else {
          setAppUser(null);
        }
      } catch (err: any) {
        console.error('Error reading initial session', err);
        setError(String(err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Subscribe to auth changes and redirect after sign-in
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setSupabaseUser(user);
      setError(null);

      if (user) {
        setLoading(true);
        const loaded = await loadAppUser(user.id);
        setLoading(false);

        // Only redirect on explicit sign-in events (SIGNED_IN) and if we have appUser
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          redirectByRole(loaded);
        }
      } else {
        setAppUser(null);
      }
    });

    return () => {
      mounted = false;
      try {
        listener.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setAppUser(null);
      router.push('/');
    } catch (err: any) {
      console.error('Sign out failed', err);
      setError(String(err?.message ?? err));
    }
  };

  const value: UserContextValue = {
    supabaseUser,
    appUser,
    loading,
    error,
    isSearching,
    setIsSearching,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}
