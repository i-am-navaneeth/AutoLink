// src/components/auth/email-login-form.tsx
'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EmailLoginForm(): JSX.Element {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // use click handler (avoid native form submit navigation)
  async function sendMagicLink() {
    if (!email) {
      alert('Enter email');
      return;
    }
    setLoading(true);
    try {
      // debug - show storage keys before request
      console.log('BEFORE signInWithOtp - localStorage keys:', Object.keys(localStorage));

      const redirectTo =
        (process.env.NEXT_PUBLIC_SITE_URL as string) || window.location.origin;

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${redirectTo}/auth/callback` },
      });

      // debug after request
      console.log('AFTER signInWithOtp - localStorage keys:', Object.keys(localStorage));
      console.log('signInWithOtp result ->', { data, error });

      if (error) {
        console.error('signInWithOtp error', error);
        alert(error.message || JSON.stringify(error));
        return;
      }

      alert('Magic link sent — check your inbox. Open link in same browser/tab.');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full">
      <label className="block text-sm font-medium mb-2">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border rounded mb-4"
        placeholder="you@example.com"
      />

      <button
        type="button"
        onClick={sendMagicLink}
        className="w-full bg-yellow-500 text-white py-3 rounded disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Login with Email'}
      </button>

      <p className="text-xs text-center mt-3">
        New to AutoLink? Enter your email — we’ll create your account.
      </p>
    </div>
  );
}
