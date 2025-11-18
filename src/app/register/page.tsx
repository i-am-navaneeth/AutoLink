'use client';

import { useState } from 'react';
import { ArrowLeft, Car, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PassengerRegisterForm from './components/passenger-register-form';
import PilotRegisterForm from './components/pilot-register-form';

type UserRole = 'passenger' | 'pilot' | null;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);

  const renderContent = () => {
    switch (role) {
      case 'passenger':
        return <PassengerRegisterForm onBack={() => setRole(null)} />;
      case 'pilot':
        return <PilotRegisterForm />; // This component already has a back button.
      default:
        return (
          <>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div>
                        <CardTitle className="font-headline text-3xl">Join AutoLink</CardTitle>
                        <CardDescription>First, tell us who you are. Choose your role to get started.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <Button size="lg" className="h-auto py-6 flex-col gap-2" onClick={() => setRole('passenger')}>
                    <User className="h-8 w-8" />
                    <span>I'm a Passenger</span>
                    <span className="text-xs font-normal text-primary-foreground/80">I need rides</span>
                </Button>
                <Button size="lg" className="h-auto py-6 flex-col gap-2" variant="secondary" onClick={() => setRole('pilot')}>
                    <Car className="h-8 w-8" />
                    <span>I'm a Pilot</span>
                    <span className="text-xs font-normal text-secondary-foreground/80">I give rides</span>
                </Button>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {role === null && (
            <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
            </Button>
        )}
        <Card className="shadow-2xl">
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
