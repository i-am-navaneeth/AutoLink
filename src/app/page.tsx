'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = () => {
    setLoginLoading(true);
    router.push('/email-login');
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg/autolink-auth-bg.png')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/20" />

      {/* Content */}
      <div className="relative max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-extrabold tracking-wide text-gray-900">
          AutoLink
        </h1>

        <p className="text-gray-700">
          Where tech meets tuktuk
        </p>

        <div className="space-y-3">
          {/* ✅ LOGIN WITH LOADING */}
          <Button
            className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-black"
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                loading…
              </>
            ) : (
              'Login with Email'
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/register')}
          >
            Register
          </Button>
        </div>
      </div>
    </main>
  );
}
