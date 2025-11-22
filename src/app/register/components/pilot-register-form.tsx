'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, ShieldCheck, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Pilot } from '@/lib/types';


export default function PilotRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: fullName });
        
        if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const pilotDocRef = doc(db, 'pilots', firebaseUser.uid);

            const newUser = {
                name: fullName,
                email: firebaseUser.email,
                role: 'pilot',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            setDocumentNonBlocking(userDocRef, newUser, {});
            
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);

            const newPilot: Partial<Pilot> = {
                id: firebaseUser.uid,
                name: fullName,
                email: firebaseUser.email,
                role: 'pilot',
                isVerified: false,
                licenseNumber: formData.get('license_number') as string,
                vehicleNumber: formData.get('vehicle_number') as string,
                vehicleType: vehicleType as any,
                // In real app, upload files and get URLs
                licenseImageUrl: 'https://placehold.co/400x250?text=License',
                createdAt: serverTimestamp() as any,
                updatedAt: serverTimestamp() as any,
            };
            setDocumentNonBlocking(pilotDocRef, newPilot, {});
        }

        toast({
            title: 'Registration Submitted',
            description: 'Your details have been submitted for verification. We will notify you upon approval.',
            duration: 5000,
        });
        router.push('/');

    } catch (error: any) {
        console.error("Pilot registration failed: ", error);
        toast({
            title: 'Registration Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
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
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Step 1: Account & Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="john.doe@example.com" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" placeholder="Create a strong password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="avatar">Profile Photo <span className="text-muted-foreground">(Optional)</span></Label>
                <Input id="avatar" name="avatar" type="file" className="pt-2 file:text-primary file:font-semibold" disabled={loading}/>
            </div>
          </div>
        </div>

        {/* Step 2: Vehicle & Docs */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Step 2: Verification Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="license_number">Driving License No.</Label>
              <Input id="license_number" name="license_number" placeholder="e.g., DL1420210012345" required disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_image_url">Upload License</Label>
              <Input id="license_image_url" name="license_image_url" type="file" required className="pt-2 file:text-primary file:font-semibold" disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input id="vehicle_number" name="vehicle_number" placeholder="e.g., KA 01 AB 1234" required disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select required onValueChange={setVehicleType} disabled={loading}>
                <SelectTrigger id="vehicle_type" name="vehicle_type">
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
              <Label htmlFor="vehicle_model">Vehicle Model <span className="text-muted-foreground">(Optional)</span></Label>
              <Input id="vehicle_model" name="vehicle_model" placeholder="e.g., Bajaj RE" disabled={loading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="vehicle_color">Vehicle Color <span className="text-muted-foreground">(Optional)</span></Label>
              <Input id="vehicle_color" name="vehicle_color" placeholder="e.g., Black and Yellow" disabled={loading}/>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bank_account">Bank Account / Payout Info</Label>
                <Input id="bank_account" name="bank_account" placeholder="Enter bank details for payouts" required disabled={loading}/>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Submit for Verification
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
