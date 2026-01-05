'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Car } from 'lucide-react';

const DEFAULT_AVATAR_URL =
  'https://placehold.co/200x200?text=Pilot';

type PilotRegisterFormProps = {
  onBack?: () => void;
};

export default function PilotRegisterForm({
  onBack,
}: PilotRegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Email and password are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      /* ---------- 1️⃣ Create auth user ---------- */
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Pilot',
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      const userId = data.user.id;

      /* ---------- 2️⃣ INIT PILOT (SERVER-SIDE) ---------- */
      const res = await fetch('/api/pilots/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          fullName,
          avatarUrl: DEFAULT_AVATAR_URL,
        }),
      });

      if (!res.ok) {
        throw new Error('Pilot initialization failed');
      }

      /* ---------- 3️⃣ APPLY REFERRAL (OPTIONAL, SILENT) ---------- */
      if (referralCode.trim()) {
        await fetch('/api/referrals/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referralCode: referralCode.trim(),
          }),
        });
      }

      await supabase.auth.refreshSession();

      /* ---------- 4️⃣ Redirect ---------- */
      router.replace('/pilot/profile');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error';

      console.error(message);

      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader className="space-y-2">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit px-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <CardTitle className="text-2xl flex items-center gap-2">
          <Car className="opacity-70" />
          Pilot Onboarding
        </CardTitle>

        <CardDescription>
          Create an account to start earning with AutoLink.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Full Name (Optional)</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 🔗 REFERRAL CODE (OPTIONAL) */}
        <div className="space-y-2">
          <Label>Referral Code (Optional)</Label>
          <Input
            placeholder="Enter pilot referral code"
            value={referralCode}
            onChange={(e) =>
              setReferralCode(e.target.value.toUpperCase())
            }
            disabled={loading}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              'Create Pilot Account'
            )}
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
