'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Route, Sparkles, Wallet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { suggestRouteAndPrice, type SuggestRouteAndPriceOutput, type SuggestRouteAndPriceInput } from '@/ai/flows/suggest-route-and-price';
import { Separator } from '../ui/separator';
import type { Pilot, RideRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AiSuggestionToolProps = {
  children: React.ReactNode;
  request: RideRequest;
  pilot: Pilot;
  currentFare: number;
  driverDestination: string;
};

export default function AiSuggestionTool({
  children,
  request,
  pilot,
  currentFare,
  driverDestination
}: AiSuggestionToolProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<SuggestRouteAndPriceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getSuggestion = async () => {
    setError(null);
    setSuggestion(null);

    const input: SuggestRouteAndPriceInput = {
        driverCurrentLocation: "Near " + request.pickupLocation, // Assuming pilot is near pickup
        driverDestination: driverDestination,
        passengerPickupLocation: request.pickupLocation,
        passengerDestination: request.destination,
        currentFare: currentFare,
        offeredFare: request.offeredFare,
    }

    startTransition(async () => {
      try {
        const result = await suggestRouteAndPrice(input);
        setSuggestion(result);
      } catch (e) {
        console.error(e);
        setError('Failed to get suggestion from AI. Please try again.');
        toast({
            title: 'Error',
            description: 'Could not fetch AI suggestion.',
            variant: 'destructive',
        })
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => { setSuggestion(null); setError(null); }}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            AI Route & Price Suggestion
          </DialogTitle>
          <DialogDescription>
            Get an optimized route and price suggestion for this ride request.
          </DialogDescription>
        </DialogHeader>

        {!suggestion && !isPending && !error && (
            <div className='text-center py-8'>
                <Button onClick={getSuggestion}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Suggestion
                </Button>
            </div>
        )}

        {isPending && (
          <div className="flex justify-center items-center py-8 space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing routes and fares...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {suggestion && (
          <div className="space-y-4 pt-4">
            <div className='space-y-2'>
                <h3 className='font-semibold flex items-center gap-2'><Wallet className='h-5 w-5 text-primary' /> Suggested Price</h3>
                <p className='text-3xl font-bold text-center py-2 text-primary'>₹{suggestion.suggestedPrice}</p>
            </div>
            <Separator />
            <div className='space-y-2'>
                <h3 className='font-semibold flex items-center gap-2'><Route className='h-5 w-5 text-primary' /> Suggested Route</h3>
                <p className='text-sm text-muted-foreground'>{suggestion.suggestedRoute}</p>
            </div>
             <Separator />
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>AI Reasoning</AlertTitle>
                <AlertDescription>
                    {suggestion.reasoning}
                </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className='mt-4'>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
