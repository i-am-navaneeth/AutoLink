'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 prevents old async errors after success
  const didSucceedRef = useRef(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    /* ---------- CLIENT VALIDATION ---------- */

    if (!email || !password) {
      toast({
        title: 'Missing details',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    didSucceedRef.current = false;

    try {
      /* ---------- 1. AUTH ---------- */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new Error('Incorrect email or password.');
      }

      if (!data.user) {
        throw new Error('Unable to sign in. Please try again.');
      }

      /* ---------- 2. MARK SUCCESS EARLY ---------- */
      didSucceedRef.current = true;

      /* ---------- 3. FETCH ROLE ---------- */
      const { data: profile, error: profileError } =
        await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

      if (profileError) {
        throw new Error('Unable to load user profile.');
      }

      /* ---------- 4. HARD REDIRECT ---------- */
      if (profile?.role === 'admin') {
        router.replace('/admin/verify-pilots');
        return;
      }

      if (profile?.role === 'pilot') {
        router.replace('/pilot/home');
        return;
      }

      router.replace('/quick-rides');
    } catch (err: any) {
      // 🔥 BLOCK TOAST IF LOGIN ALREADY SUCCEEDED
      if (didSucceedRef.current) return;

      toast({
        title: 'Login failed',
        description:
          err?.message ||
          'Something went wrong. Please try again.',
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EMAIL */}
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* SUBMIT */}
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
