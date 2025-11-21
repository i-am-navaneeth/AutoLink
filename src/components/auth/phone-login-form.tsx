'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function PhoneLoginForm() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!auth || !isClient) return;
    if (window.recaptchaVerifier) return;

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      // Render can fail in some environments — handle gracefully
      window.recaptchaVerifier
        .render()
        .catch((err) => {
          console.warn('reCAPTCHA render failed', err);
          toast({
            title: 'reCAPTCHA Error',
            description: 'Could not initialize reCAPTCHA. Please refresh the page.',
            variant: 'destructive',
          });
        });
    } catch (err) {
      console.warn('reCAPTCHA init error', err);
    }
  }, [auth, toast, isClient]);

  const ensureUserDoc = async (user: User) => {
    if (!db) return;
    const uref = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(uref);
      if (!snap.exists()) {
        const newUserDoc = {
          id: user.uid,
          name: user.displayName || 'New User',
          phone: user.phoneNumber || '',
          role: 'rider', // Default role (you can change)
          verified: true,
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        };
        // Fire-and-forget non-blocking set
        setDocumentNonBlocking(uref, newUserDoc, {});
      } else {
        setDocumentNonBlocking(uref, { lastSeen: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
      toast({
        title: 'Database Error',
        description: 'Could not save user profile.',
        variant: 'destructive',
      });
    }
  };

  const sendOtp = async () => {
    const trimmed = phoneNumber.trim().replace(/\s+/g, '');
    const fullPhoneNumber = trimmed.startsWith('+') ? trimmed : `+91${trimmed}`;
    if (!trimmed || !window.recaptchaVerifier) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ title: 'OTP Sent', description: 'Check your phone for the verification code.' });
    } catch (err: any) {
      console.error('sendOtp error', err);
      toast({ title: 'Failed to send OTP', description: err?.message || String(err), variant: 'destructive' });
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !window.confirmationResult) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter the OTP.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      await ensureUserDoc(user);
      toast({ title: 'Login Successful', description: 'Welcome to AutoLink!' });
      router.push('/home'); // Redirect to home page (adjust route as needed)
    } catch (err: any) {
      console.error('verifyOtp error', err);
      toast({ title: 'OTP Verification Failed', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div id="recaptcha-container" />
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-headline text-2xl">Phone Number Login</CardTitle>
        <CardDescription>Enter your phone number to receive a one-time password.</CardDescription>
      </CardHeader>

      {!otpSent ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground pl-1">+91</span>
              <Input
                id="phone"
                type="tel"
                placeholder="987 654 3210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-12"
                disabled={loading}
              />
            </div>
          </div>

          <Button onClick={sendOtp} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send OTP
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="otp"
                type="text"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <Button onClick={verifyOtp} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Login
          </Button>

          <Button variant="link" onClick={() => setOtpSent(false)} className="w-full">
            Back
          </Button>
        </div>
      )}
    </>
  );
}
