'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    toast({
      title: 'Registration Successful!',
      description: 'Welcome to AutoLink. You can now log in as a passenger.',
      duration: 5000,
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
              <CardTitle className="font-headline text-3xl">Passenger Registration</CardTitle>
              <CardDescription>Create your account to start booking rides.</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" placeholder="123-456-7890" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Emergency Contact</Label>
              <Input id="emergency-contact" placeholder="Name, Phone number" required />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
