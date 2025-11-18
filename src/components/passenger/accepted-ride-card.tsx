'use client';

import type { Ride } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { MapPin, MoreVertical, Users, Wallet, X } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

type AcceptedRideCardProps = {
  ride: Ride;
  onCancel: () => void;
};

export default function AcceptedRideCard({ ride, onCancel }: AcceptedRideCardProps) {
  return (
    <Card className="bg-primary/5 border-primary shadow-lg animate-fade-in-up">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Your ride is accepted by {ride.pilot.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Ride
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. You will have to search for a new ride.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={ride.pilot.avatarUrl} alt={ride.pilot.name} />
                <AvatarFallback>{ride.pilot.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className='font-semibold'>Vehicle:</div>
                <div>{ride.pilot.vehicle.number}</div>
                <div className='font-semibold'>Fare:</div>
                <div className='flex items-center gap-1'><Wallet className="h-4 w-4 text-muted-foreground" /> ₹{ride.price}</div>
                <div className='font-semibold'>Seats Left:</div>
                <div className='flex items-center gap-1'><Users className="h-4 w-4 text-muted-foreground" /> {ride.availableSeats}</div>
            </div>
        </div>
        <Button variant="outline" className="w-full">
          <MapPin className="mr-2 h-4 w-4" />
          Track Vehicle
        </Button>
      </CardContent>
    </Card>
  );
}
