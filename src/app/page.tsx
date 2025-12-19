'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">AutoLink</h1>
        <p className="text-muted-foreground">
          Where tech meets tuktuk
        </p>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/email-login')}
          >
            Login with Email
          </Button>

          <Button
            variant="secondary"
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
