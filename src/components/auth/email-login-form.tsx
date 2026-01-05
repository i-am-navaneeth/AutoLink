'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export function EmailLoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      /* ---------- 1. SIGN IN ---------- */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      const userId = data.user.id;

      /* ---------- 2. FETCH ROLE (SOURCE OF TRUTH) ---------- */
      const { data: profile, error: profileError } =
        await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

      if (profileError) throw profileError;

      /* ---------- 3. HARD, SINGLE REDIRECT ---------- */
      if (profile?.role === 'admin') {
        router.replace('/admin/verify-pilots');
        return;
      }

      if (profile?.role === 'pilot') {
        router.replace('/pilot/home');
        return;
      }

      // passenger (default)
      router.replace('/quick-rides');
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err?.message || 'Invalid credentials',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl">
          Email Login
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Login
        </Button>
      </form>
    </>
  );
}
