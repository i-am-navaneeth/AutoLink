'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function EmailLoginForm() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const ensureUserDoc = async (user: User) => {
    if (!db) return;
    const uref = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(uref);
      if (snap.exists()) {
        setDocumentNonBlocking(uref, { lastSeen: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
      toast({
        title: 'Database Error',
        description: 'Could not update user profile.',
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
        toast({
            title: "Invalid Input",
            description: "Please enter both email and password.",
            variant: "destructive"
        });
        return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await ensureUserDoc(user);
      toast({ title: 'Login Successful', description: 'Welcome back to AutoLink!' });
      router.push('/home');
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-headline text-2xl">Email Login</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                />
            </div>
        </div>
        <Button onClick={handleLogin} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
        </Button>
      </div>
    </>
  );
}
