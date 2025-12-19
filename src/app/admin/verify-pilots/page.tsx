'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type PilotRow = {
  id: string;
  name: string | null;
  email: string | null;
  is_verified: boolean;
  license_number: string | null;
  vehicle_number: string | null;
};

export default function VerifyPilotsPage() {
  const [loading, setLoading] = useState(false);
  const [pilots, setPilots] = useState<PilotRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPilots = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/pilots');

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load pilots');
      }

      setPilots(json.data ?? []);
    }catch (err) {
  const message =
    err instanceof Error ? err.message : 'Unknown error';

  console.error(message);
}
 finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPilots();
  }, []);

  const changeVerification = async (
    id: string,
    approve: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/verify-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approve }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Update failed');
      }

      await fetchPilots();
    } catch (err) {
  const message =
    err instanceof Error ? err.message : 'Unknown error';

  console.error(message);
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <CardHeader>
        <CardTitle className="text-2xl">
          Verify Pilots
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" />
            Loading...
          </div>
        )}

        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}

        {!loading && pilots.length === 0 && (
          <div>No pilots found.</div>
        )}

        <div className="grid gap-4">
          {pilots.map((p) => (
            <div
              key={p.id}
              className="p-4 border rounded-md flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {p.name ?? '—'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {p.email}
                </div>
                <div className="text-sm">
                  License: {p.license_number ?? '—'}
                </div>
                <div className="text-sm">
                  Vehicle: {p.vehicle_number ?? '—'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm mr-4">
                  {p.is_verified ? (
                    <span className="text-green-600">
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      Pending
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    changeVerification(p.id, true)
                  }
                  disabled={loading || p.is_verified}
                >
                  Approve
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    changeVerification(p.id, false)
                  }
                  disabled={loading || !p.is_verified}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
