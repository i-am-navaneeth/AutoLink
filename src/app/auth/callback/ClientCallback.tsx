// app/auth/callback/ClientCallback.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClientCallback(): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClientComponentClient();

        // read params
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // if you use code/state to complete auth flow, do that here.
        // Example placeholder: if using Supabase OAuth redirect handling you might just call supabase.auth.getSessionFromUrl()
        // (Replace with your actual logic)
        if (code) {
          // Example: if you had a specific handling, run it here.
          // await supabase.auth.exchangeCodeForSession... (use your existing logic)
        }

        // then redirect to home or dashboard
        router.replace('/');
      } catch (err) {
        // show fallback behaviour on error
        console.error('Auth callback error', err);
        router.replace('/');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  return (
    <div style={{ padding: 16 }}>
      <strong>Completing sign-in…</strong>
    </div>
  );
}
