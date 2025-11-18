'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Car, Phone, User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { setUserType } = useUser();
  const heroImage = PlaceHolderImages.find((img) => img.id === 'login-hero');

  const handleLogin = (type: 'passenger' | 'pilot') => {
    setUserType(type);
    router.push('/home');
  };

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
            <CardDescription>Login with your phone number to begin.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" className="h-auto py-4" onClick={() => router.push('/phone-login')}>
              <Phone className="mr-2" />
              Login with Phone
            </Button>
            <p className="text-center text-sm text-muted-foreground">or continue as a guest:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="h-auto py-4" onClick={() => handleLogin('passenger')}>
                <User className="mr-2" />
                I'm a Passenger
              </Button>
              <Button size="lg" className="h-auto py-4" variant="secondary" onClick={() => handleLogin('pilot')}>
                <Car className="mr-2" />
                I'm a Pilot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
