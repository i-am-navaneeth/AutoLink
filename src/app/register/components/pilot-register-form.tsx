'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Car, ShieldCheck } from 'lucide-react';
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
    <>
        <div className="mb-4 pt-4 pl-4">
            <Button variant="ghost" onClick={() => router.push('/register')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Role Selection
            </Button>
        </div>
        <CardHeader className="pt-0">
            <div className="flex items-center gap-4">
              <Car className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="font-headline text-3xl">Pilot Registration</CardTitle>
                <CardDescription>Join our network of drivers and start earning more.</CardDescription>
              </div>
            </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8 pt-6">
            <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" placeholder="123-456-7890" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select required>
                    <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="emergency-contact">Emergency Contact</Label>
                <Input id="emergency-contact" placeholder="Name, Phone number" required />
                </div>
            </div>
            </div>

            <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Verification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="license">Driving License No.</Label>
                <Input id="license" placeholder="e.g., DL1420210012345" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="pan">PAN Card No.</Label>
                <Input id="pan" placeholder="e.g., ABCDE1234F" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="license-photo">Upload License</Label>
                <Input id="license-photo" type="file" required className="pt-2 file:text-primary file:font-semibold"/>
                </div>
                <div className="space-y-2">
                <Label htmlFor="pan-photo">Upload PAN Card</Label>
                <Input id="pan-photo" type="file" required className="pt-2 file:text-primary file:font-semibold"/>
                </div>
            </div>
            </div>

            <div>
            <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="vehicle-number">Vehicle Number</Label>
                <Input id="vehicle-number" placeholder="e.g., KA 01 AB 1234" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select required>
                    <SelectTrigger id="vehicle-type">
                    <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Auto-rickshaw">Auto-rickshaw</SelectItem>
                    <SelectItem value="Cab">Cab</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vehicle-photo">Upload Vehicle Photo</Label>
                <Input id="vehicle-photo" type="file" required className="pt-2 file:text-primary file:font-semibold"/>
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
    </>
  );
}
