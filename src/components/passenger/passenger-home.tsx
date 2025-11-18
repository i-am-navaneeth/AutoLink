'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { availableRides } from '@/lib/data';
import type { Ride } from '@/lib/types';
import AcceptedRideCard from './accepted-ride-card';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';
import { Skeleton } from '../ui/skeleton';

export default function PassengerHome() {
  const { isSearching, setIsSearching } = useUser();
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const searchDuration = 50; // 50 seconds
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching && !acceptedRide) {
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

      // Simulate a pilot accepting the ride
      const rideAcceptTimeout = setTimeout(() => {
        setAcceptedRide(availableRides[0]);
        setIsSearching(false);
        toast({
          title: 'Ride Accepted!',
          description: `${availableRides[0].pilot.name} has accepted your ride request.`,
        });
      }, 10000); // Pilot accepts after 10 seconds

      timer = setTimeout(() => {
        if (!acceptedRide) {
          setIsSearching(false);
          toast({
            title: 'Request Expired',
            description: 'No pilots responded in time. Please try searching again.',
            variant: 'destructive',
          });
        }
      }, searchDuration * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
        clearTimeout(rideAcceptTimeout);
      };
    }
  }, [isSearching, acceptedRide, toast, setIsSearching]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setAcceptedRide(null);
    toast({
        title: 'Searching for Pilots',
        description: 'We are looking for pilots heading your way.',
    })
  };
  
  const handleLocationClick = () => {
    toast({
        title: 'Map Feature Coming Soon',
        description: 'You will be able to select your location from a map here.',
    });
  }

  const handleCancelRide = () => {
    toast({
      title: 'Ride Canceled',
      description: 'Your ride has been canceled.',
      variant: 'destructive',
    });
    setAcceptedRide(null);
    setIsSearching(false);
  };

  const isLoading = isSearching && !acceptedRide;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Find Your Ride</CardTitle>
          <CardDescription>Enter your destination to find pilots heading your way.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <div className="relative">
                  <button type="button" onClick={handleLocationClick} className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground'>
                    <MapPin />
                  </button>
                  <Input placeholder="Your current location" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <div className="relative">
                  <button type="button" onClick={handleLocationClick} className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground'>
                    <MapPin />
                  </button>
                  <Input placeholder="Your desired destination" className="pl-10" />
                </div>
              </div>
            </div>
            <Button type="submit" className="h-10" disabled={isSearching}>
              {isSearching && !acceptedRide ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <p className="text-lg text-muted-foreground">Almost there! We’re waiting for the pilot’s response</p>
              <div className="flex space-x-1">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {acceptedRide && (
          <AcceptedRideCard ride={acceptedRide} onCancel={handleCancelRide} />
      )}

      <div className="mt-8 text-center">
        <div className="inline-block">
            {isLoading ? (
                <div className='flex flex-col items-center gap-2'>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 w-48" />
                </div>
            ) : (
                 <>
                    <h3 className="text-2xl font-bold font-headline text-foreground/50">
                    AutoLink
                    </h3>
                    <p className="flex items-center gap-2 justify-center text-muted-foreground/50">
                    where tech meets tuktuk...
                    <Car className="h-5 w-5" />
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
