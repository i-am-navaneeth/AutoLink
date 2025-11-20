'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PilotRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Registration Submitted',
      description: 'Your details have been submitted for verification. We will notify you upon approval.',
      duration: 5000,
    });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Car className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="font-headline text-3xl">Pilot Onboarding</CardTitle>
            <CardDescription>Join our network of drivers and start earning more.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Step 1: Personal Info */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Step 1: Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Your phone for login" required type="tel" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" placeholder="john.doe@example.com" type="email" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="avatar">Profile Photo (Optional)</Label>
                <Input id="avatar" type="file" className="pt-2 file:text-primary file:font-semibold"/>
            </div>
          </div>
        </div>

        {/* Step 2: Vehicle & Docs */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Step 2: Verification Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="license_number">Driving License No.</Label>
              <Input id="license_number" placeholder="e.g., DL1420210012345" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_image_url">Upload License</Label>
              <Input id="license_image_url" type="file" required className="pt-2 file:text-primary file:font-semibold"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input id="vehicle_number" placeholder="e.g., KA 01 AB 1234" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select required>
                <SelectTrigger id="vehicle_type">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto-rickshaw</SelectItem>
                  <SelectItem value="TAXI">Taxi / Cab</SelectItem>
                  <SelectItem value="MOTORBIKE">Motorbike</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model (Optional)</Label>
              <Input id="vehicle_model" placeholder="e.g., Bajaj RE" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="vehicle_color">Vehicle Color (Optional)</Label>
              <Input id="vehicle_color" placeholder="e.g., Black and Yellow" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bank_account">Bank Account / Payout Info</Label>
                <Input id="bank_account" placeholder="Enter bank details for payouts" required />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Submit for Verification
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
