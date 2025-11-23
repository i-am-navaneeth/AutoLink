'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Passenger registration (Supabase)
 * - Signs up via supabase.auth.signUp({ email, password })
 * - If signUp returns a user, inserts a row into `users` table with role: 'passenger'
 * - If signUp requires email confirmation, informs the user to check their inbox
 *
 * Note: Do NOT put Service Role keys in client code.
 */

// Local uploaded image (your uploaded file). The platform will transform this path to a URL.
const SAMPLE_AVATAR_URL = 'sandbox:/mnt/data/8b424c3a-786e-476c-a48a-04d132e3c3c0.png';

export default function PassengerRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      toast({ title: 'Email and password are required.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      // 1) Sign up the user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // If you want immediate redirect after confirmation or magic link, set it here.
          // emailRedirectTo: `${window.location.origin}/home`
        },
      });

      if (signUpError) throw signUpError;

      // If supabase returns an auth user (no email confirmation required),
      // create the app user row immediately.
      const authUser = signUpData?.user ?? null;

      if (authUser && authUser.id) {
        // 2) insert into users table
        const newUser = {
          id: authUser.id,
          name: fullName || 'Passenger',
          email: authUser.email ?? email,
          role: 'passenger',
          avatar_url: SAMPLE_AVATAR_URL,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('users').insert(newUser);
        if (insertError) {
          // not fatal for signup — but warn & log
          console.error('Failed to create app user row:', insertError);
          toast({ title: 'Warning', description: 'Account created but failed to create profile row.', variant: 'destructive' });
        } else {
          toast({ title: 'Welcome!', description: 'Account created and profile saved.' });
        }

        // user should now be logged in — redirect to passenger area
        router.push('/quick-rides');
        return;
      }

      // If authUser is null, likely email confirmation is required (or magic-link flow).
      // Inform user to check their inbox.
      toast({
        title: 'Check your email',
        description: 'A confirmation / magic link was sent. Please open it to complete registration.',
      });
    } catch (err: any) {
      console.error('Passenger registration error:', err);
      toast({
        title: 'Registration failed',
        description: err?.message ?? String(err),
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
          <div>
            <CardTitle className="font-headline text-2xl">Passenger Signup</CardTitle>
            <CardDescription>Create an account to start booking rides.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name (Optional)</Label>
          <Input id="full_name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="john.doe@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" placeholder="Create a password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
