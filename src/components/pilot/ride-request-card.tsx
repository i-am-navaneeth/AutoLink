'use client';

import type { RideRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Check, KeyRound, Map, MoreVertical, Sparkles, Wallet, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import AiSuggestionTool from './ai-suggestion-tool';
import { mockPilot } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import PinEntryDialog from './pin-entry-dialog';

type RideRequestCardProps = {
  request: RideRequest;
  onAccept: () => void;
  onDecline: () => void;
  onRideStart: () => void;
};

export default function RideRequestCard({ request, onAccept, onDecline, onRideStart }: RideRequestCardProps) {
  const { toast } = useToast();

  const handleAccept = () => {
    toast({
      title: `Request Accepted`,
      description: `You have accepted the ride request from ${request.passenger.name}.`,
    });
    onAccept();
  };

  const handleDecline = () => {
    toast({
      title: `Request Declined`,
      description: `You have declined the ride request from ${request.passenger.name}.`,
      variant: 'destructive',
    });
    onDecline();
  };

  const handleRideStarted = () => {
    toast({
      title: 'Ride Started!',
      description: `Your ride with ${request.passenger.name} has begun.`,
    });
    onRideStart();
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex-row gap-4 items-center">
        <Avatar className="h-12 w-12">
          <AvatarImage src={request.passenger.avatarUrl} alt={request.passenger.name} />
          <AvatarFallback>{request.passenger.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>{request.passenger.name}</CardTitle>
          <CardDescription>Wants a ride</CardDescription>
        </div>
        {request.status === 'accepted' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDecline} className="text-destructive focus:bg-destructive/80 focus:text-destructive-foreground">
                <X className="mr-2 h-4 w-4" />
                Cancel Ride
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="truncate max-w-[40%]">{request.pickupLocation}</span>
          <ArrowRight className="h-4 w-4 shrink-0 mx-2" />
          <span className="truncate max-w-[40%] text-right">{request.destination}</span>
        </div>

        <div className="flex justify-around items-center text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground">₹{request.offeredFare}</span>
            </div>
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground">{request.distance} km</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        {request.status === 'pending' && (
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              <X className="mr-1 h-4 w-4" />
              Decline
            </Button>

            <AiSuggestionTool
              request={request}
              pilot={mockPilot}
              currentFare={100}
              driverDestination="Indiranagar, Bangalore"
            >
              <Button variant="outline" size="sm" className="w-full border-accent/50 text-accent hover:bg-accent/10 hover:text-accent">
                <Sparkles className="mr-1 h-4 w-4" />
                AI
              </Button>
            </AiSuggestionTool>

            <Button size="sm" onClick={handleAccept}>
              <Check className="mr-1 h-4 w-4" />
              Accept
            </Button>
          </div>
        )}
        {request.status === 'accepted' && (
          <PinEntryDialog passengerName={request.passenger.name} onPinVerified={handleRideStarted}>
             <Button className="w-full">
                <KeyRound className="mr-2 h-4 w-4" />
                Start Ride
              </Button>
          </PinEntryDialog>

        )}
        {request.status === 'started' && (
            <Button variant="secondary" disabled className='w-full'>
                <Check className="mr-2 h-4 w-4" />
                Ride in Progress
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
