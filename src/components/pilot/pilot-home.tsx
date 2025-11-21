'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import RideRequestCard from './ride-request-card';
import { Bell, MapPin, MoreVertical, PlusCircle, Users, Zap, Car } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Ride } from '@/lib/types';
import PinEntryDialog from './pin-entry-dialog';
import { useUser } from '@/context/user-context';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';

export default function PilotHome() {
  const [seats, setSeats] = useState('');
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [fare, setFare] = useState('');
  const [seatError, setSeatError] = useState('');

  const { firebaseUser } = useUser();
  const db = useFirestore();
  const { data: rides, isLoading: ridesLoading } = useCollection<Ride>(db ? collection(db, 'rides') : null);

  const {
    isRideLive,
    setIsRideLive,
    passengerCount,
    setPassengerCount,
    isQuickRideLive,
    setIsQuickRideLive,
  } = useUser();

  const [rideRequests, setRideRequests] = useState<Ride[]>([]);
  const { toast } = useToast();
  const [hasNotified, setHasNotified] = useState(false);

  const isFormValid = origin && destination && fare && seats && !seatError;
  const isPilotLive = isRideLive || isQuickRideLive;

  useEffect(() => {
    if(rides) {
        const pendingRequests = rides.filter(ride => ride.status === 'requested');
        setRideRequests(pendingRequests);
    }
  }, [rides]);

  useEffect(() => {
    if (isRideLive && rideRequests.length > 0 && !hasNotified) {
      toast({
        title: 'New Ride Request!',
        description: 'You have a new passenger request. Check your dashboard.',
      });
      setHasNotified(true);
    }
  }, [isRideLive, rideRequests, hasNotified, toast]);

  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeats(value);
    if (Number(value) > 8) {
      setSeatError('Maximum 8 seats allowed for safety and local rules.');
    } else {
      setSeatError('');
    }
  };

  const handleStartRide = () => {
    if (!isFormValid) {
       toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields to start a ride.',
      });
      return;
    }
    if (Number(seats) > 8 || Number(seats) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Seat Number',
        description: 'Please enter a number of seats between 1 and 8.',
      });
      return;
    }
    
    toast({
      title: 'Ride Sharing Started!',
      description: 'You are now visible to passengers along your route.',
    });
    setIsRideLive(true);
    setIsQuickRideLive(false); // Cancel quick ride mode
    setPassengerCount(0); // Reset passenger count on new ride
    setHasNotified(false); // Reset notification status
  };

  const handleGoLiveForQuickRides = () => {
    if (isRideLive && passengerCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Go Live',
        description: `You have ${passengerCount} passenger(s) from a shared ride. Please end the current ride first.`,
      });
      return;
    }
    toast({
      title: 'Live for Quick Rides!',
      description: 'You will now receive instant ride requests.',
    });
    setIsQuickRideLive(true);
    setIsRideLive(false); // Cancel ride sharing mode
  };

  const handleEndRide = () => {
    if (passengerCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot End Ride',
        description: `You cannot end the ride with ${passengerCount} passenger(s) still in the vehicle.`,
      });
    } else {
      toast({
        title: 'Ride Ended',
        description: 'You are no longer visible to passengers.',
      });
      setIsRideLive(false);
      setSeats('');
      setDestination('');
      setOrigin('');
      setFare('');
      setRideRequests([]);
    }
  };
  
  const handleStopQuickRides = () => {
    toast({
      title: 'Stopped Quick Rides',
      description: 'You are no longer receiving instant ride requests.',
    });
    setIsQuickRideLive(false);
  }

  const handleRequestAccepted = async (rideId: string) => {
    if (!db || !firebaseUser.user) return;

    if (parseInt(seats, 10) - passengerCount > 0) {
        const rideRef = doc(db, 'rides', rideId);
        try {
            await updateDoc(rideRef, {
                status: 'accepted',
                pilotId: firebaseUser.user.uid,
            });
            toast({
                title: `Request Accepted`,
                description: `You have accepted the ride request.`,
            });
        } catch (error) {
            console.error("Failed to accept ride: ", error);
            toast({
                title: `Accept Failed`,
                description: `Could not accept the ride. Please try again.`,
                variant: 'destructive'
            });
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'No more seats available',
            description: 'You cannot accept more passengers than available seats.',
        })
    }
  };

  const handleRequestDeclined = async (rideId: string) => {
    if (!db) return;
    const rideRef = doc(db, 'rides', rideId);
    try {
        await updateDoc(rideRef, { status: 'cancelled' }); // Or deleteDoc(rideRef)
        toast({
            title: `Request Declined`,
            description: `You have declined the ride request.`,
            variant: 'destructive',
        });
    } catch (error) {
        console.error("Failed to decline ride: ", error);
        toast({
            title: `Decline Failed`,
            description: `Could not decline the ride. Please try again.`,
            variant: 'destructive'
        });
    }
  }

  const handleRideStarted = (rideId?: string) => {
    setPassengerCount(passengerCount + 1);
    if (rideId) {
        // Update ride status to 'started' in Firestore
    }
  }

  return (
    <div className="space-y-8">
       {!isQuickRideLive && (
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleGoLiveForQuickRides}
            disabled={isRideLive && passengerCount > 0}
          >
            <Zap className="mr-2 h-5 w-5" />
            Go Live for Quick Rides
          </Button>
      )}

      {isQuickRideLive && (
         <Card className="shadow-lg text-center bg-primary/10 border-primary">
            <CardContent className="p-6 flex flex-col items-center gap-4">
               <div className="flex items-center justify-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <p className="text-xl font-semibold text-primary">Live for Quick Rides</p>
                </div>
                <Button variant="destructive" onClick={handleStopQuickRides}>Stop Receiving Quick Rides</Button>
            </CardContent>
         </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Start a Shared Ride</CardTitle>
            <CardDescription>Let passengers know your route to get ride requests.</CardDescription>
          </div>
          {isRideLive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEndRide} className="text-destructive focus:bg-destructive/80 focus:text-destructive-foreground">
                  End Ride
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRideLive ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="origin" 
                      placeholder="Your starting point" 
                      className="pl-10" 
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      disabled={isQuickRideLive}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="destination" 
                      placeholder="Your final destination" 
                      className="pl-10" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      disabled={isQuickRideLive}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fare">Base Fare per Seat</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input 
                      id="fare" 
                      type="number" 
                      placeholder="e.g., 100" 
                      className="pl-8" 
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      disabled={isQuickRideLive}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Available Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    placeholder="e.g., 2"
                    value={seats}
                    onChange={handleSeatChange}
                    max={8}
                    className={seatError ? 'border-destructive' : ''}
                    disabled={isQuickRideLive}
                  />
                  {seatError && <p className="text-xs text-destructive">{seatError}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Bell />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Auto Accept Rides</p>
                  <p className="text-sm text-muted-foreground">Automatically accept matching ride requests.</p>
                </div>
                <Switch id="auto-accept" disabled={isQuickRideLive}/>
              </div>
              <Button size="lg" className="w-full" onClick={handleStartRide} disabled={!isFormValid || isQuickRideLive}>
                Start Ride
              </Button>
            </>
          ) : (
            <div className='space-y-4'>
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </div>
                  <p className="text-xl font-semibold text-primary">Your shared ride is Live</p>
                </div>
              </div>
              <PinEntryDialog 
                passengerName='a new passenger'
                onPinVerified={() => handleRideStarted()}
              >
                  <Button variant="link" className="text-blue-600">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Passenger
                  </Button>
              </PinEntryDialog>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isRideLive && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Current Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 text-center">
                 <div>
                    <p className="text-4xl font-bold">{passengerCount}</p>
                    <p className="text-muted-foreground">Passenger(s)</p>
                 </div>
                 <div className="text-2xl text-muted-foreground">/</div>
                 <div>
                    <p className="text-4xl font-bold">{seats}</p>
                    <p className="text-muted-foreground">Total Seats</p>
                 </div>
            </CardContent>
        </Card>
      )}

      {isRideLive ? (
        <div>
          <h2 className="text-xl font-bold mb-4 font-headline">Shared Ride Requests</h2>
          {ridesLoading ? <p>Loading requests...</p> : rideRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rideRequests.map((request) => (
                <RideRequestCard 
                  key={request.id} 
                  request={request} 
                  onAccept={() => handleRequestAccepted(request.id)}
                  onDecline={() => handleRequestDeclined(request.id)}
                  onRideStart={() => handleRideStarted(request.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12">
              <p className="text-muted-foreground">No ride requests at the moment.</p>
              <p className="text-sm text-muted-foreground">Waiting for passengers along your route.</p>
            </Card>
          )}
        </div>
      ) : (
        <div className="mt-8 text-center">
            <div className="inline-block">
                {isPilotLive ? (
                    <div className='relative overflow-hidden'>
                        <h3 className="text-2xl font-bold font-headline text-foreground/50">AutoLink</h3>
                        <p className="flex items-center gap-2 justify-center text-muted-foreground/50">
                        where tech meets tuktuk...
                        <Car className="h-5 w-5" />
                        </p>
                        <div className="shimmer-text"></div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-2xl font-bold font-headline text-foreground/50">AutoLink</h3>
                        <p className="flex items-center gap-2 justify-center text-muted-foreground/50">
                        where tech meets tuktuk...
                        <Car className="h-5 w-5" />
                        </p>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
