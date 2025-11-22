'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const heroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');

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
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-4 animate-fade-in-down">
          AutoLink
        </h1>
        <p className="max-w-xl text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in-up">
          Connecting riders and drivers, efficiently. Maximize your earnings, minimize your wait.
        </p>
        <Card className="w-full max-w-md animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Login with your email to begin.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" className="h-auto py-4" onClick={() => router.push('/email-login')}>
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
                <Link href="/register">
                    Create a new Account
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
