'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClientCallback(): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Verifying…');

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClientComponentClient();

        // read query params
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // If there is a code (OAuth), exchange/finish the auth here.
        if (code) {
          // Exchange the authorization code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        setMsg('Authentication complete — redirecting...');
        router.replace('/');
      } catch (err) {
        console.error('Auth callback error', err);
        setMsg('Authentication failed — redirecting...');
        router.replace('/');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <strong>{msg}</strong>
    </div>
  );
}
