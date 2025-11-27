'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const params = useSearchParams();
  const [msg, setMsg] = useState('Verifying...');

  useEffect(() => {
    const run = async () => {
      const code = params.get('code');

      if (!code) {
        setMsg('No code found in callback URL');
        return;
      }

      // NEW Supabase v2 method
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('exchangeCodeForSession error:', error);
        setMsg(error.message);
        return;
      }

      // SUCCESS
      router.replace('/home');
    };

    run();
  }, [params, router, supabase]);

  return <div className="p-6 text-center">{msg}</div>;
}
