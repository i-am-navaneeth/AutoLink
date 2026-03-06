'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/* ================= GOOGLE MAPS CONFIG ================= */

const LIBRARIES: ('places')[] = ['places'];

type LocationPoint = {
  address: string;
  lat: number;
  lng: number;
};

export default function PassengerHomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  /* ---------- Google Maps Loader ---------- */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  /* ---------- Autocomplete refs ---------- */
  const fromAC = useRef<google.maps.places.Autocomplete | null>(null);
  const toAC = useRef<google.maps.places.Autocomplete | null>(null);

  /* ---------- State ---------- */
  const [from, setFrom] = useState<LocationPoint | null>(null);
  const [to, setTo] = useState<LocationPoint | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSearch = async () => {
  if (!from || !to || !user) return;

  setIsSearching(true);
  setProgress(0);

  try {
    const res = await fetch('/api/rides/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passengerId: user.id,
        pickup: from,
        dropoff: to,
        distanceKm: 0,
        ride_type: 'share',
        rideDate: null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setIsSearching(false);
      toast({
        title: 'Ride creation failed',
        description: json.error ?? 'Something went wrong',
        variant: 'destructive',
      });
      return;
    }

    // Trigger matching engine
    fetch('/api/rides/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rideId: json.ride.id,
      }),
    });

  } catch {
    setIsSearching(false);
    toast({
      title: 'Network error',
      variant: 'destructive',
    });
  }
};

useEffect(() => {
  if (!isSearching) return;

  const timeout = setTimeout(() => {
    setIsSearching(false);
    toast({
      title: 'No pilots available',
      description: 'Please try again shortly',
      variant: 'destructive',
    });
  }, 60_000);

  return () => clearTimeout(timeout);
}, [isSearching, toast]);

useEffect(() => {
  if (!isSearching) {
    setProgress(0);
    return;
  }

  let value = 0;

  const interval = setInterval(() => {
    value += 100 / 60;
    setProgress(Math.min(value, 100));
  }, 1000);

  return () => clearInterval(interval);
}, [isSearching]);

  return (
    <div className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Find Your Ride
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your destination to find pilots heading your way.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* FROM */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => (fromAC.current = ac)}
                  onPlaceChanged={() => {
                    const place = fromAC.current?.getPlace();
                    if (place?.geometry && place.formatted_address) {
                      setFrom({
                        address: place.formatted_address,
                        lat: place.geometry.location!.lat(),
                        lng: place.geometry.location!.lng(),
                      });
                    }
                  }}
                  restrictions={{ country: 'in' }}
                >
                  <Input
                    placeholder="Your current location"
                    className="pl-10"
                    value={from?.address || ''}
                    disabled={isSearching}
                    onChange={(e) =>
                      setFrom((prev) => ({
                        address: e.target.value,
                        lat: prev?.lat ?? 0,
                        lng: prev?.lng ?? 0,
                      }))
                    }
                  />
                </Autocomplete>
              ) : (
                <Input
                  disabled
                  placeholder="Loading location..."
                  className="pl-10"
                />
              )}
            </div>
          </div>

          {/* TO */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => (toAC.current = ac)}
                  onPlaceChanged={() => {
                    const place = toAC.current?.getPlace();
                    if (place?.geometry && place.formatted_address) {
                      setTo({
                        address: place.formatted_address,
                        lat: place.geometry.location!.lat(),
                        lng: place.geometry.location!.lng(),
                      });
                    }
                  }}
                  restrictions={{ country: 'in' }}
                >
                  <Input
                    placeholder="Your desired destination"
                    className="pl-10"
                    value={to?.address || ''}
                    disabled={isSearching}
                    onChange={(e) =>
                      setTo((prev) => ({
                        address: e.target.value,
                        lat: prev?.lat ?? 0,
                        lng: prev?.lng ?? 0,
                      }))
                    }
                  />
                </Autocomplete>
              ) : (
                <Input
                  disabled
                  placeholder="Loading location..."
                  className="pl-10"
                />
              )}
            </div>
          </div>

          {/* SEARCH BUTTON */}
          {!isSearching && (
  <Button
    className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-medium"
    size="lg"
    disabled={!from || !to}
    onClick={handleSearch}
  >
    <Search className="mr-2 h-5 w-5" />
    Search
  </Button>
)}

{isSearching && (
  <Card className="mt-6">
    <CardContent className="p-6 text-center space-y-4">
      <p>Finding a pilot...</p>
      <Progress value={progress} />
    </CardContent>
  </Card>
)}
        </CardContent>
      </Card>
    </div>
  );
}