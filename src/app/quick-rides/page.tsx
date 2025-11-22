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
import { useFirestore, useCollection } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import type { Ride } from '@/lib/types';
import AcceptedRideCard from '@/components/passenger/accepted-ride-card';


export default function QuickRidesPage() {
  const [date, setDate] = useState<Date>();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [createdRideId, setCreatedRideId] = useState<string | null>(null);

  const { toast } = useToast();
  const { isSearching, setIsSearching } = useUser();
  const [progress, setProgress] = useState(0);
  const searchDuration = 70; // 70 seconds
  const { firebaseUser } = useUser();
  const db = useFirestore();

  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  // Listen for updates on the created ride
  useEffect(() => {
    if (!db || !createdRideId) return;

    const q = query(collection(db, "rides"), where("id", "==", createdRideId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
                const updatedRide = change.doc.data() as Ride;
                if(updatedRide.status === 'accepted') {
                    setAcceptedRide(updatedRide);
                    setIsSearching(false);
                    toast({
                        title: 'Ride Accepted!',
                        description: `A pilot has accepted your ride request.`,
                    });
                }
            }
        });
    });

    return () => unsubscribe();
  }, [db, createdRideId, setIsSearching, toast]);


  useEffect(() => {
    if (pickup && dropoff) {
      // Basic validation
      if (pickup.length < 3 || dropoff.length < 3) {
        setDistance(null);
        return;
      }
      // Simulate distance calculation
      const randomDistance = Math.random() * 20 + 1; // 1 to 21 km
      setDistance(parseFloat(randomDistance.toFixed(1)));
    } else {
      setDistance(null);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    if (distance) {
      // 1km min price is 10, base fare 20
      const calculatedPrice = Math.max(10, Math.round(distance * 12 + 20));
      setPrice(calculatedPrice);
    } else {
      setPrice(null);
    }
  }, [distance]);


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
            setCreatedRideId(null); // Reset ride ID
            toast({
            title: 'Search Expired',
            description: 'No pilots were found in time. Please try searching again.',
            variant: 'destructive',
            });
        }
      }, searchDuration * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isSearching, toast, setIsSearching, acceptedRide]);


  const handleFindRide = async () => {
    if (!db || !firebaseUser.user) {
        toast({ title: 'You must be logged in to book a ride.', variant: 'destructive'});
        return;
    }
    // Basic coordinate validation
    const lat = 12.9716; // Dummy lat
    const lng = 77.5946; // Dummy lng
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast({ title: 'Invalid location coordinates.', variant: 'destructive' });
        return;
    }

    setIsSearching(true);
    setAcceptedRide(null);
    setCreatedRideId(null);

    const newRide: Omit<Ride, 'id' | 'createdAt' | 'updatedAt'> = {
        passengerId: firebaseUser.user.uid,
        pickupAddress: pickup,
        pickupLat: lat,
        pickupLng: lng,
        dropoffAddress: dropoff,
        dropoffLat: lat + 0.1, // Dummy
        dropoffLng: lng + 0.1, // Dummy
        status: 'requested',
        fareEstimate: price || 0,
        distanceKm: distance || 0,
        createdAt: serverTimestamp() as any, 
        updatedAt: serverTimestamp() as any,
    };

    try {
        const rideCollection = collection(db, 'rides');
        const docRef = await addDoc(rideCollection, newRide);
        setCreatedRideId(docRef.id);
        
        toast({
            title: 'Searching for Rides',
            description: 'We are looking for available pilots for you.',
        })
    } catch (error) {
        console.error("Error creating ride request: ", error);
        toast({ title: 'Failed to create ride request.', variant: 'destructive' });
        setIsSearching(false);
    }
  }

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Book a Ride</CardTitle>
          <CardDescription>Book a vehicle just for yourself, anytime.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="pickup" placeholder="Enter pickup location" className="pl-10" disabled={isSearching} value={pickup} onChange={(e) => setPickup(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="dropoff" placeholder="Enter destination" className="pl-10" disabled={isSearching} value={dropoff} onChange={(e) => setDropoff(e.target.value)}/>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="date">Pre-book for a future date (Optional)</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                        )}
                        disabled={isSearching}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
               </div>
               {price && (
                <Card className="bg-secondary/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      <p className="font-semibold">Estimated Fare</p>
                    </div>
                    <p className="text-xl font-bold">₹{price}</p>
                  </CardContent>
                </Card>
              )}
              <Button size="lg" className="w-full" onClick={handleFindRide} disabled={isSearching || !pickup || !dropoff}>
                {isSearching ? (
                   <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                   </>
                ) : (
                    <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Find My Ride
                    </>
                )}
              </Button>
            </div>
            {isSearching && !acceptedRide && (
              <Card className='bg-secondary'>
                <CardContent className="p-6 text-center space-y-4 flex flex-col justify-center items-center h-full">
                  <div className="flex justify-center items-center space-x-2">
                    <p className="text-lg text-muted-foreground">Finding a pilot for you...</p>
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
                <AcceptedRideCard ride={acceptedRide} onCancel={() => {}} />
            )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
