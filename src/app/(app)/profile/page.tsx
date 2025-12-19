'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context';

import { AppLayout } from '@/components/layout/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { Camera, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const { user: authUser, userType, logout, isRideLive, passengerCount } =
    useUser();
  const { toast } = useToast();
  const isPilot = userType === 'pilot';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 🔽 Load profile
  useEffect(() => {
    if (!authUser) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, phone, license, vehicle_number, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (error) return;

      setFullName(data?.full_name ?? '');
      setMobile(data?.phone ?? '');
      setLicense(data?.license ?? '');
      setVehicleNumber(data?.vehicle_number ?? '');
      setAvatarUrl(data?.avatar_url ?? null);
    };

    loadProfile();
  }, [authUser]);

  // 📸 Avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    const ext = file.name.split('.').pop();
    const path = `${authUser.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: uploadError.message,
      });
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', authUser.id);

    setAvatarUrl(publicUrl);

    toast({ title: 'Avatar updated' });
  };

  // 💾 Save profile
  const handleSaveChanges = async () => {
    if (!authUser) return;

    setSaving(true);

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: mobile,
        license: isPilot ? license : null,
        vehicle_number: isPilot ? vehicleNumber : null,
      })
      .eq('id', authUser.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
      return;
    }

    console.log('UPDATED USER:', data);

    toast({
      title: 'Profile Updated',
      description: 'Changes saved successfully.',
    });
  };

  const handleLogout = () => {
    if (isPilot && isRideLive && passengerCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot log out',
        description: 'End the ride first.',
      });
      return;
    }
    logout();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Profile</CardTitle>
            <CardDescription>
              Manage your personal information and account settings.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage src={avatarUrl ?? ''} />
                  <AvatarFallback>
                    {authUser?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-4 w-4" />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {fullName || 'User'}
                </h2>
                <p className="text-muted-foreground">
                  {authUser?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={authUser?.email ?? ''} disabled />
              </div>

              {isPilot && (
                <>
                  <div>
                    <Label>License</Label>
                    <Input
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Vehicle Number</Label>
                    <Input
                      value={vehicleNumber}
                      onChange={(e) =>
                        setVehicleNumber(e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm logout?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You’ll be redirected to login.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
