// src/components/pilot/pilot-home.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/user-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type PilotRow = {
  id: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  vehicleType?: string;
  vehicleNumber?: string;
  // extend with your pilot columns...
};

export default function PilotHome() {
  const { supabaseUser } = useUser();
  const [pilot, setPilot] = useState<PilotRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPilot = async () => {
      if (!supabaseUser) {
        setPilot(null);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (!mounted) return;
      if (error) {
        console.error('Fetch pilot error', error);
        setPilot(null);
      } else {
        setPilot(data ?? null);
      }
      setLoading(false);
    };

    loadPilot();
    return () => { mounted = false; };
  }, [supabaseUser]);

  if (!supabaseUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not signed in</CardTitle>
          <CardDescription>Please sign in to view your pilot dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You must be logged in to access pilot features.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!pilot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>No pilot profile found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We couldn't find your pilot profile. Please complete your onboarding.</p>
          <Button onClick={() => { /* navigate to registration */ }}>Complete Onboarding</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {pilot.name ?? 'Pilot'}</CardTitle>
        <CardDescription>Pilot dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><strong>Verified:</strong> {pilot.isVerified ? 'Yes' : 'No'}</div>
          <div><strong>Vehicle:</strong> {pilot.vehicleType ?? '—'} {pilot.vehicleNumber ?? ''}</div>
          <div><strong>Email:</strong> {pilot.email ?? '—'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
