'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Ride } from '@/lib/types';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import {
  MapPin,
  MoreVertical,
  Wallet,
  X,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import PassengerRideMap from '@/components/maps/passenger-ride-map';

type AcceptedRideCardProps = {
  ride: Ride;
  pilotName?: string;
  onCancel: () => void;
};

export default function AcceptedRideCard({
  ride,
  pilotName,
  onCancel,
}: AcceptedRideCardProps) {
  const [pilotLocation, setPilotLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 🔁 Pilot live location listener
  useEffect(() => {
    if (!ride?.pilotId) return;

    const channel = supabase
      .channel(`pilot-${ride.pilotId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pilot_locations',
          filter: `pilot_id=eq.${ride.pilotId}`,
        },
        (payload) => {
          const { lat, lng } = payload.new as {
            lat: number;
            lng: number;
          };

          setPilotLocation({ lat, lng });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ride?.pilotId]);

  return (
    <Card className="bg-primary/5 border-primary shadow-lg animate-fade-in-up">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          Your ride is accepted by {pilotName || 'a pilot'}
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Ride
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to cancel?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. You will have to
                    search for a new ride.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="font-semibold">Fare:</div>
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              ₹{ride.fareEstimate}
            </div>

            <div className="font-semibold">Distance:</div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {ride.distanceKm} km
            </div>
          </div>
        </div>

        {pilotLocation && (
          <PassengerRideMap pilotLocation={pilotLocation} />
        )}

        <Button variant="outline" className="w-full">
          <MapPin className="mr-2 h-4 w-4" />
          Track Vehicle
        </Button>
      </CardContent>
    </Card>
  );
}
