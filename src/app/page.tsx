'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg/autolink-auth-bg.png')",
      }}
    >
      {/* Overlay for readability (optional but recommended) */}
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
          <Button
            className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-black"
            onClick={() => router.push('/email-login')}
          >
            Login with Email
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
