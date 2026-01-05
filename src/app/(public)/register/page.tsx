'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import PassengerRegisterForm from '@/components/auth/PassengerRegisterForm';

type UserRole = 'passenger' | null;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg mx-auto">

        <Card className="shadow-2xl">
          {role === 'passenger' ? (
            <PassengerRegisterForm onBack={() => setRole(null)} />
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-3xl">
                  Join AutoLink
                </CardTitle>
                <CardDescription>
                  Choose how you want to use AutoLink
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <Button
                  size="lg"
                  className="h-auto py-8 flex flex-col gap-2"
                  onClick={() => setRole('passenger')}
                >
                  <User className="h-8 w-8" />
                  <span className="text-lg font-semibold">
                    I’m a Passenger
                  </span>
                  <span className="text-xs opacity-80">
                    Book rides easily
                  </span>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="h-auto py-8 flex flex-col gap-2"
                  onClick={() => router.push('/pilot-register')}
                >
                  <Car className="h-8 w-8" />
                  <span className="text-lg font-semibold">
                    I’m a Pilot
                  </span>
                  <span className="text-xs opacity-80">
                    Earn by giving rides
                  </span>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
