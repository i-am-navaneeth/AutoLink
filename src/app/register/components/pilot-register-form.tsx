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

import { supabase } from '@/lib/supabaseClient';
import type { Pilot } from '@/lib/types';

export default function PilotRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState<Pilot['vehicleType'] | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Supabase Auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'pilot',
          },
        },
      });

      if (authError) throw authError;

      const authUser = data.user;

      // Insert into users table
      const { error: userError } = await supabase.from('users').insert({
        id: authUser?.id,
        name: fullName,
        email,
        role: 'pilot',
      });

      if (userError) throw userError;

      // Insert into pilots table
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const getString = (key: string): string | undefined => {
        const v = formData.get(key);
        return typeof v === 'string' ? v : undefined;
      };

      const { error: pilotError } = await supabase.from('pilots').insert({
        id: authUser?.id,
        name: fullName,
        email,
        role: 'pilot',
        isVerified: false,
        licenseNumber: getString('license_number'),
        vehicleNumber: getString('vehicle_number'),
        vehicleType: vehicleType || undefined,
        licenseImageUrl: 'https://placehold.co/400x250?text=License',
      });

      if (pilotError) throw pilotError;

      toast({
        title: 'Submitted for Verification',
        description: 'Your details were submitted. We will notify you once verified.',
      });

      router.push('/');

    } catch (error: any) {
      console.error('Pilot registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unknown error',
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
            <CardDescription>Join our network of drivers and start earning.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">

        {/* Personal Info */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Step 1: Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required disabled={loading} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Profile Photo (Optional)</Label>
              <Input type="file" disabled={loading} />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Step 2: Documents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Driving License No.</Label>
              <Input name="license_number" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Upload License</Label>
              <Input name="license_image_url" type="file" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input name="vehicle_number" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select required disabled={loading} onValueChange={(v) => setVehicleType(v as Pilot['vehicleType'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto-rickshaw</SelectItem>
                  <SelectItem value="TAXI">Taxi / Cab</SelectItem>
                  <SelectItem value="MOTORBIKE">Motorbike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Model (Optional)</Label>
              <Input name="vehicle_model" disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Vehicle Color (Optional)</Label>
              <Input name="vehicle_color" disabled={loading} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Bank Account Info</Label>
              <Input name="bank_account" required disabled={loading} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Submit for Verification
          </Button>
        </div>

      </CardContent>
    </form>
  );
}
