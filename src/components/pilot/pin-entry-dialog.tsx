'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type PinEntryDialogProps = {
  children: React.ReactNode;
  passengerName: string;
  onPinVerified: () => void;
};

export default function PinEntryDialog({ children, passengerName, onPinVerified }: PinEntryDialogProps) {
  const [pin, setPin] = useState('');
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const { toast } = useToast();
  const correctPin = '1234'; // In a real app, this would come from the backend

  const handleStartRideWithPin = () => {
    if (pin === correctPin) {
      onPinVerified();
      setPinDialogOpen(false);
      setPin('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid PIN',
        description: 'The PIN you entered is incorrect. Please try again.',
      });
    }
  };

  return (
    <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Passenger's PIN</DialogTitle>
          <DialogDescription>
            To start the ride, please ask {passengerName} for their 4-digit PIN.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="pin" className="sr-only">
            PIN
          </Label>
          <Input
            id="pin"
            type="password"
            maxLength={4}
            placeholder="****"
            className="text-center text-2xl tracking-[1rem]"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleStartRideWithPin}>Confirm & Start</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
