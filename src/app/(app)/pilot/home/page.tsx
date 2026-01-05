'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

type LiveMode = 'offline' | 'quick' | 'shared';

export default function PilotHomePage() {
  const [liveMode, setLiveMode] = useState<LiveMode>('offline');
  const [blink, setBlink] = useState(false);

  // Shared ride form
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState<number | ''>('');
  const [seats, setSeats] = useState<number>(1);
  const [autoAccept, setAutoAccept] = useState(false);

  /* ================= BLINK EFFECT ================= */
  useEffect(() => {
    if (liveMode === 'quick' || liveMode === 'shared') {
      const i = setInterval(() => setBlink(v => !v), 600);
      return () => clearInterval(i);
    }
    setBlink(false);
  }, [liveMode]);

  /* ================= HELPERS ================= */

  const isQuick = liveMode === 'quick';
  const isShared = liveMode === 'shared';

  const sharedFormValid =
    origin.trim().length > 0 &&
    destination.trim().length > 0 &&
    typeof fare === 'number' &&
    fare > 0 &&
    seats >= 1 &&
    seats <= 3;

  /* ================= ACTIONS ================= */

  const toggleQuickRide = async () => {
    if (isShared) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const nextMode: LiveMode = isQuick ? 'offline' : 'quick';

    const res = await fetch('/api/pilots/live-mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: nextMode }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    setLiveMode(nextMode);
  };

  const startSharedRide = async () => {
    if (isQuick || !sharedFormValid) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/pilots/live-mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        mode: 'shared',
        shared: {
          origin,
          destination,
          fare,
          seats,
          auto_accept: autoAccept,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    setLiveMode('shared');
  };

  const endSharedRide = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/pilots/live-mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ mode: 'offline' }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    setLiveMode('offline');
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">

      {/* ⚡ GO LIVE FOR QUICK RIDES */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={toggleQuickRide}
            className="w-full bg-yellow-400 text-black font-semibold text-lg py-6 flex items-center justify-center gap-2"
          >
            ⚡ Go Live for Quick Rides
            {isQuick && (
              <span
                className={`h-2 w-2 rounded-full bg-white ${
                  blink ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 🚕 START SHARED RIDE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Start a Shared Ride
            {isShared && (
              <span
                className={`h-2 w-2 rounded-full bg-green-500 ${
                  blink ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter route details to receive shared ride requests
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <input
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            placeholder="Origin"
            className="w-full border rounded-md px-3 py-2"
            disabled={isShared}
          />

          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Destination"
            className="w-full border rounded-md px-3 py-2"
            disabled={isShared}
          />

          <input
            type="number"
            min={1}
            value={fare}
            onChange={e =>
              setFare(Math.max(1, Number(e.target.value)) || '')
            }
            placeholder="Base fare per seat (₹)"
            className="w-full border rounded-md px-3 py-2"
            disabled={isShared}
          />

          <input
            type="number"
            min={1}
            max={3}
            value={seats}
            onChange={e =>
              setSeats(Math.min(3, Math.max(1, Number(e.target.value))))
            }
            placeholder="Seats (1–3)"
            className="w-full border rounded-md px-3 py-2"
            disabled={isShared}
          />

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Bell />
              <div>
                <p className="font-medium">Auto Accept Rides</p>
                <p className="text-sm text-muted-foreground">
                  Automatically accept matching requests
                </p>
              </div>
            </div>
            <Switch
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
              disabled={isShared}
            />
          </div>

          {!isShared ? (
            <Button
              onClick={startSharedRide}
              disabled={isQuick || !sharedFormValid}
              className="w-full bg-yellow-400 text-black font-semibold py-6"
            >
              Start Shared Ride
            </Button>
          ) : (
            <Button
              onClick={endSharedRide}
              className="w-full bg-red-500 text-white font-semibold py-6"
            >
              End Shared Ride
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm pt-6">
        <p className="text-lg font-semibold">AutoLink</p>
        <p>where tech meets tuk tuk</p>
      </div>
    </div>
  );
}
