'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, ShieldCheck, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User as AppUser } from '@/lib/types';


type PassengerRegisterFormProps = {
  onBack: () => void;
};

export default function PassengerRegisterForm({ onBack }: PassengerRegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({ title: "Email and password are required.", variant: 'destructive'});
        return;
    }
    setLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (fullName) {
            await updateProfile(firebaseUser, { displayName: fullName });
        }
        
        if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const newUser: Omit<AppUser, 'id'> = {
                name: fullName || 'New Passenger',
                email: firebaseUser.email || '',
                role: 'passenger',
                createdAt: serverTimestamp() as any,
                updatedAt: serverTimestamp() as any,
            };
            setDocumentNonBlocking(userDocRef, newUser, {});
        }

        toast({
            title: 'Registration Successful!',
            description: 'Welcome to AutoLink. You can now log in.',
        });
        router.push('/');

    } catch (error: any) {
        console.error("Registration failed: ", error);
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
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft />
          </Button>
          <div className="flex items-center gap-4">
            <User className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Passenger Signup</CardTitle>
              <CardDescription>Create your account to start booking rides.</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name (Optional)</Label>
              <Input id="full_name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="john.doe@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="Create a password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
            </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            Create Account
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
