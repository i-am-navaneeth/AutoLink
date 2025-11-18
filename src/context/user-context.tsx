'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RideRequest } from '@/lib/types';
import { useUser as useFirebaseUser } from '@/firebase';

export type UserType = 'passenger' | 'pilot' | null;

interface UserContextType {
  userType: UserType;
  setUserType: (userType: UserType) => void;
  logout: () => void;
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
  firebaseUser: ReturnType<typeof useFirebaseUser>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserTypeState] = useState<UserType>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isRideLive, setIsRideLive] = useState(false);
  const [isQuickRideLive, setIsQuickRideLive] = useState(false);
  const [passengerCount, setPassengerCount] = useState(0);
  const [quickRideRequest, setQuickRideRequest] = useState<RideRequest | null>(null);
  const router = useRouter();
  const firebaseUser = useFirebaseUser();

  useEffect(() => {
    try {
      const storedUserType = localStorage.getItem('userType') as UserType;
      if (storedUserType) {
        setUserTypeState(storedUserType);
      }
    } catch (error) {
        // localStorage is not available
    }
  }, []);

  const setUserType = (userType: UserType) => {
    setUserTypeState(userType);
    try {
      if (userType) {
        localStorage.setItem('userType', userType);
      } else {
        localStorage.removeItem('userType');
      }
    } catch (error) {
        // localStorage is not available
    }
  };

  const logout = () => {
    // Note: Firebase signout is handled separately if needed
    setUserType(null);
    setIsSearching(false);
    setIsRideLive(false);
    setIsQuickRideLive(false);
    setPassengerCount(0);
    setQuickRideRequest(null);
    router.push('/');
  };

  return (
    <UserContext.Provider value={{ 
      userType, 
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
      firebaseUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
