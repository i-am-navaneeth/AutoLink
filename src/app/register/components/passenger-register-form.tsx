'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PassengerRegisterFormProps = {
  onBack: () => void;
};

export default function PassengerRegisterForm({ onBack }: PassengerRegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission, e.g., call an API to create the user
    toast({
      title: 'Registration Successful!',
      description: 'Welcome to AutoLink. You can now log in.',
    });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft />
          </Button>
          <div className="flex items-center gap-4">
            <User className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Passenger Signup</CardTitle>
              <CardDescription>Create your account to start booking rides.</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name (Optional)</Label>
              <Input id="full_name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Your phone number for OTP" required type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" placeholder="john.doe@example.com" type="email" />
            </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
