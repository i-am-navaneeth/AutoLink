'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [msg, setMsg] = useState('Verifying...');

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (!code) {
          setMsg('No code found in callback URL');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('exchangeCodeForSession error:', error);
          setMsg(error.message);
          return;
        }

        router.replace('/home');
      } catch (e: any) {
        console.error('Callback error:', e);
        setMsg(e.message || 'Authentication failed');
      }
    };

    run();
  }, [router, supabase]);

  return <div className="p-6 text-center">{msg}</div>;
}
