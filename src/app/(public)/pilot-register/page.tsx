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
        

        <CardContent>
          <PilotRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
