'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PilotRow = {
  id: string;
  name?: string | null;
  email?: string | null;
  is_verified?: boolean | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
};

export default function PilotHome() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<any | null>(null);
  const [pilot, setPilot] = useState<PilotRow | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Get authenticated user
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data, error } =
        await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
       console.error(error.message);
       return;
      } else {
        setAuthUser(data.user ?? null);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // 2️⃣ Load pilot profile
  useEffect(() => {
    let mounted = true;

    const loadPilot = async () => {
      if (!authUser) {
        setPilot(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!mounted) return;

      if (error) {
       console.error(error.message);
       return;
       } else {
        setPilot(data);
      }

      setLoading(false);
    };

    loadPilot();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!authUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not signed in</CardTitle>
          <CardDescription>
            Please log in to access the pilot dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!pilot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Pilot profile not found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Please complete pilot onboarding to continue.
          </p>
          <Button
            onClick={() =>
              router.push('/pilot-register')
            }
          >
            Complete Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Welcome, {pilot.name ?? 'Pilot'}
        </CardTitle>
        <CardDescription>
          Pilot dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div>
          <strong>Verified:</strong>{' '}
          {pilot.is_verified ? 'Yes' : 'Pending'}
        </div>
        <div>
          <strong>Vehicle:</strong>{' '}
          {pilot.vehicle_type ?? '—'}{' '}
          {pilot.vehicle_number ?? ''}
        </div>
        <div>
          <strong>Email:</strong>{' '}
          {pilot.email ?? '—'}
        </div>
      </CardContent>
    </Card>
  );
}
