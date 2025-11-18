'use client';

import Image from 'next/image';
import type { Ride } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MessageSquare, Users, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type PilotCardProps = {
  ride: Ride;
};

export default function PilotCard({ ride }: PilotCardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleRequestSent = () => {
    toast({
      title: 'Request Sent!',
      description: `Your ride request has been sent to ${ride.pilot.name}.`,
    });
    setOpen(false);
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex-row gap-4 items-center">
        <Avatar className="h-12 w-12">
          <AvatarImage src={ride.pilot.avatarUrl} alt={ride.pilot.name} />
          <AvatarFallback>{ride.pilot.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{ride.pilot.name}</CardTitle>
          <CardDescription>{ride.pilot.vehicle.number}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="truncate max-w-[40%]">{ride.origin}</span>
          <ArrowRight className="h-4 w-4 shrink-0 mx-2" />
          <span className="truncate max-w-[40%] text-right">{ride.destination}</span>
        </div>

        <div className="flex justify-around items-center text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">₹{ride.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{ride.availableSeats} seats left</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-accent hover:bg-accent/90">Request Ride</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Ride with {ride.pilot.name}</DialogTitle>
              <DialogDescription>Confirm your ride details. You can suggest a different fare.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>Route:</Label>
                <span className="font-semibold text-sm">
                  {ride.origin} to {ride.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label>Standard Fare:</Label>
                <span className="font-semibold">₹{ride.price}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offered-fare">Your Fare Offer (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input id="offered-fare" type="number" placeholder={String(ride.price)} className="pl-6" />
                </div>
                <p className="text-xs text-muted-foreground">The pilot will review your offer.</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleRequestSent}>Send Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
