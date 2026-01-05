'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LivePilotMap({ pilotId }: { pilotId: string }) {
  const [pos, setPos] = useState<{ lat: number; lng: number }>();

  useEffect(() => {
    const channel = supabase
      .channel('pilot-location')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pilot_locations',
          filter: `pilot_id=eq.${pilotId}`,
        },
        (payload) => {
          const d = payload.new as any;
          setPos({ lat: d.lat, lng: d.lng });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pilotId]);

  if (!pos) return null;

  return (
    <GoogleMap
      center={pos}
      zoom={15}
      mapContainerStyle={{ width: '100%', height: '300px' }}
    >
      <Marker position={pos} />
    </GoogleMap>
  );
}
