'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Loader2, User, Car, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Use your uploaded image as placeholder
const LICENSE_PLACEHOLDER =
  'sandbox:/mnt/data/8b424c3a-786e-476c-a48a-04d132e3c3c0.png';

export default function PilotRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !vehicleType) {
      toast({
        title: 'Missing Details',
        description: 'Fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Auth User (Supabase)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      const authUser = signUpData.user;

      // 2️⃣ If email confirmation OFF → user exists immediately
      //     If confirmation ON → user null → skip DB insert & show message
      if (authUser?.id) {
        const userId = authUser.id;

        // 2️⃣ Insert into users table
        const { error: userErr } = await supabase.from('users').insert({
          id: userId,
          name: fullName,
          email,
          role: 'pilot',
          avatar_url: LICENSE_PLACEHOLDER,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (userErr) {
          console.error(userErr);
          toast({
            title: 'Warning',
            description: 'Account created but user profile failed.',
            variant: 'destructive',
          });
        }

        // 3️⃣ Insert into pilots table
        const { error: pilotErr } = await supabase.from('pilots').insert({
          id: userId,
          name: fullName,
          email,
          vehicleType,
          isVerified: false,
          licenseImageUrl: LICENSE_PLACEHOLDER,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (pilotErr) {
          console.error(pilotErr);
          toast({
            title: 'Warning',
            description: 'Pilot details save failed.',
            variant: 'destructive',
          });
        }

        toast({
          title: 'Registration Submitted',
          description: 'We will verify your details soon.',
        });

        router.push('/pilot-dashboard');
        return;
      }

      // 4️⃣ If confirmation required → show notice
      toast({
        title: 'Check your email',
        description: 'A confirmation link was sent to your inbox.',
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Pilot registration failed',
        description: error.message ?? 'Unknown error',
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
            <CardDescription>Join our drivers and start earning.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">

        {/* PERSONAL DETAILS */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Step 1: Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required disabled={loading} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* VEHICLE DETAILS */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Step 2: Vehicle Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select required onValueChange={setVehicleType} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="TAXI">Taxi</SelectItem>
                  <SelectItem value="MOTORBIKE">Motorbike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Submit for Verification
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
