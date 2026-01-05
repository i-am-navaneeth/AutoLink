'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context';

export default function PilotLocationTracker() {
  const { user, userType, pilotVerificationStatus } = useUser();

  useEffect(() => {
    // 🔒 HARD BLOCK: only VERIFIED pilots can send live location
    if (
      !user ||
      userType !== 'pilot' ||
      pilotVerificationStatus !== 'approved'
    ) {
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { error } = await supabase
          .from('pilot_locations')
          .upsert({
            pilot_id: user.id,
            lat: latitude,
            lng: longitude,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Location update failed:', error.message);
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    // 🧹 cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user, userType, pilotVerificationStatus]);

  return null;
}
