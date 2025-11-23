'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, MapPin, Rocket, Loader2, IndianRupee } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/context/user-context';

import { supabase } from '@/lib/supabaseClient';
import type { Ride } from '@/lib/types';

import AcceptedRideCard from '@/components/passenger/accepted-ride-card';

export default function QuickRidesPage() {
  const [date, setDate] = useState<Date>();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  const { toast } = useToast();
  const { isSearching, setIsSearching, user: firebaseUser } = useUser();

  const [progress, setProgress] = useState(0);
  const searchDuration = 70; // 70 seconds

  // Listen for ride updates via Supabase realtime
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
              description: `A pilot has accepted your ride request.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createdRideId, toast, setIsSearching]);

  // Distance simulation
  useEffect(() => {
    if (pickup && dropoff) {
      const randomDistance = Math.random() * 20 + 1;
      setDistance(parseFloat(randomDistance.toFixed(1)));
    } else {
      setDistance(null);
    }
  }, [pickup, dropoff]);

  // Price calculation
  useEffect(() => {
    if (distance) {
      const calculatedPrice = Math.max(10, Math.round(distance * 12 + 20));
      setPrice(calculatedPrice);
    }
  }, [distance]);

  // Progress bar + search timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isSearching) {
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 100 / searchDuration;
        });
      }, 1000);

      timer = setTimeout(() => {
        if (!acceptedRide) {
          setIsSearching(false);
          setCreatedRideId(null);
          toast({
            title: 'Search Expired',
            description: 'No pilots were found. Please try again.',
            variant: 'destructive',
          });
        }
      }, searchDuration * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isSearching, acceptedRide, toast, setIsSearching]);

  const handleFindRide = async () => {
    if (!firebaseUser?.user) {
      toast({ title: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    const lat = 12.9716;
    const lng = 77.5946;

    setIsSearching(true);
    setAcceptedRide(null);
    setCreatedRideId(null);

    const { data, error } = await supabase
      .from('rides')
      .insert({
        passengerId: firebaseUser.user.id,
        pickupAddress: pickup,
        pickupLat: lat,
        pickupLng: lng,
        dropoffAddress: dropoff,
        dropoffLat: lat + 0.1,
        dropoffLng: lng + 0.1,
        status: 'requested',
        fareEstimate: price || 0,
        distanceKm: distance || 0,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast({ title: 'Ride request failed.', variant: 'destructive' });
      setIsSearching(false);
      return;
    }

    setCreatedRideId(data.id);

    toast({
      title: 'Searching for Pilots...',
      description: 'We are looking for available drivers nearby.',
    });
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Book a Ride</CardTitle>
          <CardDescription>Book a vehicle anytime.</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Pickup</Label>
              <Input value={pickup} disabled={isSearching} onChange={(e) => setPickup(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Drop-off</Label>
              <Input value={dropoff} disabled={isSearching} onChange={(e) => setDropoff(e.target.value)} />
            </div>

            <div className="space-y-2">
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
              <Card className="bg-secondary/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <p className="font-semibold">Estimated Fare</p>
                  <p className="text-xl font-bold">₹{price}</p>
                </CardContent>
              </Card>
            )}

            <Button className="w-full" disabled={!pickup || !dropoff || isSearching} onClick={handleFindRide}>
              {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
              {isSearching ? 'Searching...' : 'Find My Ride'}
            </Button>
          </div>

          {/* Right Side Content */}
          {isSearching && !acceptedRide && (
            <Card className="bg-secondary">
              <CardContent className="p-6 text-center space-y-4 flex flex-col justify-center items-center h-full">
                <p className="text-lg text-muted-foreground">Finding a pilot...</p>
                <Progress value={progress} className="w-full" />
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
                  description: 'You have cancelled your ride request.',
                  variant: 'destructive',
                });
              }}
            />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
