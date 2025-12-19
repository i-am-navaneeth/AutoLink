'use client';

import PilotRegisterForm from '@/components/auth/pilot-register-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Car } from 'lucide-react';

export default function PilotRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Car className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">
                Pilot Onboarding
              </CardTitle>
              <CardDescription>
                Register as a driver and start earning with AutoLink.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <PilotRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
