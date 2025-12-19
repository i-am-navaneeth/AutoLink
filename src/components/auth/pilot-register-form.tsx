'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, ShieldCheck, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type VehicleType = 'AUTO' | 'TAXI' | 'MOTORBIKE';

export default function PilotRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  // Auth
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Vehicle / Docs
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !fullName ||
      !email ||
      !password ||
      !licenseNumber ||
      !vehicleNumber ||
      !vehicleType
    ) {
      toast({
        title: 'All required fields must be filled',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Auth user
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'pilot',
            },
          },
        });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('User creation failed');

      const userId = data.user.id;

      // 2️⃣ Insert into users table
      const { error: userError } =
        await supabase.from('users').insert({
          id: userId,
          name: fullName,
          email,
          role: 'pilot',
        });

      if (userError) throw new Error(userError.message);

      // 3️⃣ Insert into pilots table
      const { error: pilotError } =
        await supabase.from('pilots').insert({
          id: userId,
          name: fullName,
          email,
          role: 'pilot',
          is_verified: false,
          license_number: licenseNumber,
          vehicle_number: vehicleNumber,
          vehicle_type: vehicleType,
          license_image_url:
            'https://placehold.co/400x250?text=License',
        });

      if (pilotError) throw new Error(pilotError.message);

      toast({
        title: 'Submitted for Verification',
        description:
          'Your details were submitted. You will be notified once approved.',
      });

      router.push('/');
    } catch (err) {
  const message =
    err instanceof Error ? err.message : 'Unknown error';

  console.error(message);
}
 finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Car className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-3xl">
              Pilot Onboarding
            </CardTitle>
            <CardDescription>
              Register as a driver and start earning
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Step 1: Personal Info
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              <Input
                required
                disabled={loading}
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Step 2: Vehicle & License
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Driving License Number</Label>
              <Input
                required
                disabled={loading}
                value={licenseNumber}
                onChange={(e) =>
                  setLicenseNumber(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Vehicle Number</Label>
              <Input
                required
                disabled={loading}
                value={vehicleNumber}
                onChange={(e) =>
                  setVehicleNumber(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Vehicle Type</Label>
              <Select
                disabled={loading}
                onValueChange={(v) =>
                  setVehicleType(v as VehicleType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">
                    Auto-Rickshaw
                  </SelectItem>
                  <SelectItem value="TAXI">
                    Taxi / Cab
                  </SelectItem>
                  <SelectItem value="MOTORBIKE">
                    Motorbike
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-5 w-5" />
            )}
            Submit for Verification
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
