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
import { Loader2, ArrowLeft } from 'lucide-react';

type PassengerRegisterFormProps = {
  onBack?: () => void;
};

export default function PassengerRegisterForm({
  onBack,
}: PassengerRegisterFormProps) {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Passenger',
            referral_code: referralCode.trim()
              ? referralCode.trim().toUpperCase()
              : null,
          },
        },
      });

      if (error) throw error;

      // Store referral locally (optional future use)
      if (referralCode.trim()) {
        localStorage.setItem(
          'pending_referral_code',
          referralCode.trim().toUpperCase()
        );
      }

      toast({
        title: 'Account created',
        description: data.session
          ? 'Your account is ready.'
          : 'Check your email and click the link to continue.',
      });

      /**
       * ✅ HANDLE BOTH MODES
       * - Email confirm OFF  → session exists → auto login
       * - Email confirm ON   → no session → email-login
       */
      if (data.session) {
        router.replace('/quick-rides');
      } else {
        router.replace('/email-login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);

      toast({
        title: 'Registration failed',
        description:
          err?.message ||
          err?.error?.message ||
          'Signup failed. Try again.',
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

        <CardTitle className="text-2xl">
          Passenger Signup
        </CardTitle>
        <CardDescription>
          Create an account to start booking rides.
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

        <div className="space-y-2">
          <Label>Referral Code (Optional)</Label>
          <Input
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
              'Create Account'
            )}
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
