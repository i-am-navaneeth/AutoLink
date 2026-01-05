'use client';

import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

import { useUser } from '@/context/user-context';
import { supabase } from '@/lib/supabase/client';
import type { Ride } from '@/lib/types';
import AcceptedRideCard from '@/components/passenger/accepted-ride-card';

/* ================= GOOGLE MAPS CONFIG ================= */

const LIBRARIES: ('places')[] = ['places'];

type LocationPoint = {
  address: string;
  lat: number;
  lng: number;
};

/* ================= PAGE ================= */

export default function QuickRidesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useUser();

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!loading && !user) router.replace('/email-login');
  }, [loading, user, router]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Redirecting...</div>;

  /* ---------- Google Maps Loader ---------- */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  /* ---------- Autocomplete refs ---------- */
  const pickupAC = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAC = useRef<google.maps.places.Autocomplete | null>(null);

  /* ---------- State ---------- */
  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(null);

  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const searchDuration = 70;

  /* ---------- Use Current Location ---------- */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !isLoaded) {
      toast({ title: 'Location not available', variant: 'destructive' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geocoder = new google.maps.Geocoder();
        const res = await geocoder.geocode({
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });

        if (res.results[0]) {
          setPickup({
            address: res.results[0].formatted_address,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      },
      () => {
        toast({ title: 'Location permission denied', variant: 'destructive' });
      },
      { enableHighAccuracy: true }
    );
  };

  /* ---------- Distance + Fare (TEMP MVP) ---------- */
  useEffect(() => {
    if (pickup && dropoff) {
      const d = Math.random() * 20 + 1;
      setDistance(Number(d.toFixed(1)));
    } else {
      setDistance(null);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    if (distance !== null) {
      setPrice(Math.max(10, Math.round(distance * 12 + 20)));
    } else {
      setPrice(null);
    }
  }, [distance]);

  /* ---------- Ride Updates (Realtime) ---------- */
  useEffect(() => {
    if (!createdRideId) return;

    const channel = supabase
      .channel(`ride-${createdRideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${createdRideId}`,
        },
        (payload) => {
          const updated = payload.new as Ride;
          if (updated.status === 'accepted') {
            setAcceptedRide(updated);
            setIsSearching(false);
            toast({ title: 'Ride Accepted!' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createdRideId, toast]);

  /* ---------- Find Ride (SERVER API ONLY) ---------- */
  const handleFindRide = async () => {
    if (!pickup || !dropoff) return;

    setIsSearching(true);
    setAcceptedRide(null);
    setCreatedRideId(null);

    const res = await fetch('/api/rides/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passengerId: user.id,
        pickup,
        dropoff,
        rideDate: null, // instant ride (Rapido-style)
        fare: price ?? 0,
        distanceKm: distance ?? 0,
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

    setCreatedRideId(json.ride.id);

    toast({
      title: 'Searching for pilots...',
    });
  };

  /* ================= UI ================= */

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book a Ride</CardTitle>
          <CardDescription>Choose real locations only</CardDescription>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Pickup */}
            <div>
              <Label>Pickup</Label>

              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => (pickupAC.current = ac)}
                  onPlaceChanged={() => {
                    const place = pickupAC.current?.getPlace();
                    if (place?.geometry && place.formatted_address) {
                      setPickup({
                        address: place.formatted_address,
                        lat: place.geometry.location!.lat(),
                        lng: place.geometry.location!.lng(),
                      });
                    }
                  }}
                  restrictions={{ country: 'in' }}
                >
                  <Input placeholder="Enter pickup location" />
                </Autocomplete>
              ) : (
                <Input disabled placeholder="Loading map…" />
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleUseCurrentLocation}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </Button>
            </div>

            {/* Dropoff */}
            <div>
              <Label>Drop-off</Label>

              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => (dropoffAC.current = ac)}
                  onPlaceChanged={() => {
                    const place = dropoffAC.current?.getPlace();
                    if (place?.geometry && place.formatted_address) {
                      setDropoff({
                        address: place.formatted_address,
                        lat: place.geometry.location!.lat(),
                        lng: place.geometry.location!.lng(),
                      });
                    }
                  }}
                  restrictions={{ country: 'in' }}
                >
                  <Input placeholder="Enter destination" />
                </Autocomplete>
              ) : (
                <Input disabled placeholder="Loading map…" />
              )}
            </div>

            <Button
              className="w-full"
              disabled={!pickup || !dropoff || isSearching}
              onClick={handleFindRide}
            >
              {isSearching ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Rocket className="mr-2" />
              )}
              {isSearching ? 'Searching...' : 'Find My Ride'}
            </Button>
          </div>

          {isSearching && !acceptedRide && (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <p>Finding a pilot...</p>
                <Progress value={progress} />
              </CardContent>
            </Card>
          )}

          {acceptedRide && (
            <AcceptedRideCard
              ride={acceptedRide}
              onCancel={() => {
                setAcceptedRide(null);
                setCreatedRideId(null);
                setIsSearching(false);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Brand Footer */}
      <div className="mt-20 mb-6 flex items-center justify-center text-center select-none">
        <p className="text-[12px] sm:text-[13px] font-medium text-[#8A8D94]">
          <span className="font-semibold text-[#6B6F76]">AutoLink</span>
          <span className="mx-2">•</span>
          <span className="text-[#9A9CA3]">where tech meets tuktuk</span>
        </p>
      </div>
    </>
  );
}
