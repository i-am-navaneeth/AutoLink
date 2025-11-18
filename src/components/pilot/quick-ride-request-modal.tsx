'use client';

import { useState, useEffect } from 'react';
import type { RideRequest } from '@/lib/types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MapPin, IndianRupee, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';

type QuickRideRequestModalProps = {
  request: RideRequest;
  onClose: () => void;
};

const COUNTDOWN_SECONDS = 15;

export default function QuickRideRequestModal({ request, onClose }: QuickRideRequestModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const { toast } = useToast();
  const { setIsQuickRideLive } = useUser();

  const handleDecline = () => {
    toast({
      title: 'Quick Ride Declined',
      description: `The request from ${request.passenger.name} has been missed.`,
      variant: 'destructive',
    });
    onClose();
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleDecline();
    }
  }, [countdown, handleDecline]);

  const handleAccept = () => {
    toast({
      title: 'Quick Ride Accepted!',
      description: `You have accepted the ride from ${request.passenger.name}.`,
    });
    // Here you would typically navigate to a live ride screen
    setIsQuickRideLive(false); // Pilot is now busy with a ride
    onClose();
  };

  const progress = (countdown / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-4 text-foreground animate-fade-in-up">
      <button onClick={handleDecline} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
        <X className="h-6 w-6" />
      </button>

      <div className="text-center space-y-4 max-w-md w-full">
         <div className="relative inline-block">
            <h3 className="text-3xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer">
              AutoLink
            </h3>
            <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-shimmer">
              New Quick Ride Request!
            </p>
        </div>
        
        <div className="bg-card p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={request.passenger.avatarUrl} alt={request.passenger.name} />
                    <AvatarFallback>{request.passenger.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold">{request.passenger.name}</p>
            </div>

            <div className="space-y-2 text-center">
                 <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <p className='truncate'>{request.pickupLocation}</p>
                 </div>
                 <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto" />
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <p className='truncate'>{request.destination}</p>
                 </div>
            </div>

            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-2xl font-bold">₹{request.offeredFare}</p>
                    <p className="text-sm text-muted-foreground">Fare</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold">{request.distance} km</p>
                    <p className="text-sm text-muted-foreground">Distance</p>
                </div>
            </div>
            
            <div className="space-y-3">
                <Button size="lg" className="w-full h-14 text-lg" onClick={handleAccept}>
                    Accept
                </Button>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="absolute h-full bg-primary transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
