'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';

import Image from 'next/image';
import { Mail } from 'lucide-react';
import Link from 'next/link';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PublicHomePage() {
  const router = useRouter();
  const { user, userType, loading } = useUser();

  /* ---------------- REDIRECT AUTHENTICATED USERS ---------------- */


    useEffect(() => {
  if (loading) return;

  if (user) {
    router.replace('/quick-rides');
  }
}, [loading, user, router]);

  /* ---------------- BLOCK UI WHILE REDIRECTING ---------------- */

  if (loading || user) {
    return null;
  }

  /* ---------------- PUBLIC LANDING UI ---------------- */

  const heroImage = PlaceHolderImages.find(
    (img) => img.id === 'login-hero'
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover object-center z-0"
        />
      )}

      <div className="absolute inset-0 bg-primary/80 z-10" />

      <div className="z-20 flex flex-col items-center text-center text-primary-foreground">
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-4">
          AutoLink
        </h1>

        <p className="max-w-xl text-lg md:text-xl text-primary-foreground/90 mb-8">
          Connecting riders and drivers, efficiently. Maximize your earnings,
          minimize your wait.
        </p>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Login with your email to begin.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Button
              size="lg"
              className="h-auto py-4"
              onClick={() => router.push('/login')}
            >
              <Mail className="mr-2" />
              Login with Email
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  New to AutoLink?
                </span>
              </div>
            </div>

            <Button asChild variant="secondary">
              <Link href="/register">Create a new Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
