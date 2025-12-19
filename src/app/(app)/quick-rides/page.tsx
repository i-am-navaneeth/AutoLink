'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppLayout } from '@/components/layout/app-layout';
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
import {
  CalendarIcon,
  Rocket,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

import { useUser } from '@/context/user-context';
import { supabase } from '@/lib/supabase/client';
import type { Ride } from '@/lib/types';
import AcceptedRideCard from '@/components/passenger/accepted-ride-card';

export default function QuickRidesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useUser();

  // 🔐 Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const [date, setDate] = useState<Date>();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const searchDuration = 70;

  // 🔁 Ride updates
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
            toast({
              title: 'Ride Accepted!',
              description: 'A pilot has accepted your ride.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createdRideId, toast]);

  // 📏 Distance simulation
  useEffect(() => {
    if (pickup && dropoff) {
      const d = Math.random() * 20 + 1;
      setDistance(parseFloat(d.toFixed(1)));
    } else {
      setDistance(null);
    }
  }, [pickup, dropoff]);

  // 💰 Price calculation
  useEffect(() => {
    if (distance) {
      setPrice(Math.max(10, Math.round(distance * 12 + 20)));
    } else {
      setPrice(null);
    }
  }, [distance]);

  // ⏱ Progress
  useEffect(() => {
    if (!isSearching) return;

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / searchDuration));
    }, 1000);

    const timeout = setTimeout(() => {
      if (!acceptedRide) {
        setIsSearching(false);
        setCreatedRideId(null);
        toast({
          title: 'Search Expired',
          description: 'No pilots found. Please try again.',
          variant: 'destructive',
        });
      }
    }, searchDuration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSearching, acceptedRide, toast]);

  const handleFindRide = async () => {
    setIsSearching(true);
    setAcceptedRide(null);
    setCreatedRideId(null);

    const lat = 12.9716;
    const lng = 77.5946;

    const { data, error } = await supabase
      .from('rides')
      .insert({
        passenger_id: user.id,
        pickup_address: pickup,
        pickup_lat: lat,
        pickup_lng: lng,
        dropoff_address: dropoff,
        dropoff_lat: lat + 0.1,
        dropoff_lng: lng + 0.1,
        status: 'requested',
        fare_estimate: price ?? 0,
        distance_km: distance ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    setCreatedRideId(data.id);

    toast({
      title: 'Searching for Pilots...',
      description: 'Looking for nearby drivers.',
    });
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book a Ride</CardTitle>
          <CardDescription>Book a vehicle anytime.</CardDescription>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <Label>Pickup</Label>
              <Input
                value={pickup}
                disabled={isSearching}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            <div>
              <Label>Drop-off</Label>
              <Input
                value={dropoff}
                disabled={isSearching}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>

            <div>
              <Label>Pre-book (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={isSearching}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>

            {price && (
              <Card>
                <CardContent className="p-4 flex justify-between">
                  <span>Estimated Fare</span>
                  <strong>₹{price}</strong>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full"
              disabled={!pickup || !dropoff || isSearching}
              onClick={handleFindRide}
            >
              {isSearching ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-5 w-5" />
              )}
              {isSearching ? 'Searching...' : 'Find My Ride'}
            </Button>
          </div>

          {/* Right */}
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
                toast({
                  title: 'Ride Cancelled',
                  variant: 'destructive',
                });
              }}
            />
          )}
        </CardContent>
      </Card>

        {/* Brand Signature – AutoLink Footer */}
<div className="mt-24 mb-6 flex items-center justify-center text-center select-none">
  <p
    className="text-[12px] sm:text-[13px] font-medium text-[#8A8D94]"
    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
  >
    <span className="font-semibold text-[#6B6F76]">AutoLink</span>
    <span className="mx-2">•</span>
    <span className="text-[#9A9CA3]">where tech meets tuktuk</span>
  </p>
</div> 

    </AppLayout>
  );
}
