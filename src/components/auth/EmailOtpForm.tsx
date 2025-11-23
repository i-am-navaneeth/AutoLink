'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function EmailOtpForm() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'enter' | 'verify' | 'done'>('enter');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage('Please enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      // Sends email OTP (Supabase will send an OTP code to email)
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin }});
      // Note: signInWithOtp triggers an email with OTP code depending on Supabase config
      if (error) throw error;
      setStep('verify');
      setMessage('OTP sent — check your email. If it does not arrive, try Resend.');
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);

    if (!/^\d{4,6}$/.test(code)) {
      setMessage('Enter the 6-digit code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      // Verify OTP — type 'email' means email OTP
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;

      // on success, Supabase will set a session cookie; optionally check user session:
      const sessionResp = await supabase.auth.getSession();
      if (sessionResp?.data?.session) {
        setStep('done');
        setMessage('Logged in successfully.');
        // optionally redirect or update app state — your UserProvider listens to auth changes
        // window.location.href = '/';
      } else {
        // Some Supabase setups rely on magic link instead — if so, tell user to click email link
        setMessage('Verified — if you are not redirected automatically, refresh the page or go to home.');
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Verification failed. Try again or resend OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendCount((c) => c + 1);
    setMessage(null);
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage('Resent OTP. Check your email.');
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 'enter' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <h2 className="text-xl font-semibold">Sign in with Email (OTP)</h2>
          <label className="block">
            <span>Email</span>
            <input
              className="w-full border px-3 py-2 rounded"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
          {message && <p className="text-sm mt-2">{message}</p>}
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <h2 className="text-xl font-semibold">Enter OTP</h2>
          <p className="text-sm text-muted-foreground">We sent a 6-digit code to <strong>{email}</strong></p>

          <label className="block">
            <span>6-digit code</span>
            <input
              className="w-full border px-3 py-2 rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="\d*"
              placeholder="123456"
              required
            />
          </label>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resendCount >= 3}
              className="btn-ghost px-3 py-2"
            >
              Resend {resendCount > 0 ? `(${resendCount})` : ''}
            </button>
          </div>

          {message && <p className="text-sm mt-2">{message}</p>}
        </form>
      )}

      {step === 'done' && (
        <div>
          <h2 className="text-xl font-semibold">Welcome!</h2>
          <p className="mt-2">You're now logged in. Redirecting…</p>
        </div>
      )}
    </div>
  );
}
