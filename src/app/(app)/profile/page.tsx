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
import {
  Camera,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
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
  const {
    user: authUser,
    userType,
    pilotVerificationStatus,
    logout,
    isRideLive,
    passengerCount,
  } = useUser();

  const { toast } = useToast();
  const isPilot = userType === 'pilot';
  const isLocked = isPilot && pilotVerificationStatus === 'approved';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    if (!authUser) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select(
          'full_name, phone, license, vehicle_number, avatar_url'
        )
        .eq('id', authUser.id)
        .maybeSingle();

      if (!data) return;

      setFullName(data.full_name ?? '');
      setMobile(data.phone ?? '');
      setLicense(data.license ?? '');
      setVehicleNumber(data.vehicle_number ?? '');
      setAvatarUrl(data.avatar_url ?? null);
    };

    loadProfile();
  }, [authUser]);

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleAvatarClick = () => {
    if (isLocked) return;
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

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSaveChanges = async () => {
  if (!authUser) return;

  setSaving(true);

  try {
    /* ---------- UPDATE USERS (ALL ROLES) ---------- */
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: mobile,
      })
      .eq('id', authUser.id);

    if (userError) throw userError;

    /* ---------- UPDATE PILOT DATA (ONLY IF PILOT) ---------- */
    if (isPilot) {
      const { error: pilotError } = await supabase
        .from('pilots')
        .update({
          license,
          vehicle_number: vehicleNumber,
        })
        .eq('id', authUser.id);

      if (pilotError) throw pilotError;
    }

    toast({
      title: 'Profile updated',
      description: 'Changes saved successfully.',
    });
  } catch (err) {
    toast({
      variant: 'destructive',
      title: 'Update failed',
      description:
        err instanceof Error ? err.message : 'Permission denied',
    });
  } finally {
    setSaving(false);
  }
};

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    if (isPilot && isRideLive && passengerCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot log out',
        description: 'End the ride first.',
      });
      return;
    }
    await logout();
  };

  /* ---------------- PILOT BADGE ---------------- */
  const PilotBadge = () => {
    if (!isPilot) return null;

    if (pilotVerificationStatus === 'approved') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Pilot Verified
        </div>
      );
    }

    if (pilotVerificationStatus === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
          <XCircle className="h-4 w-4" />
          Verification Rejected
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm font-medium">
        <Clock className="h-4 w-4" />
        Verification Pending
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Profile</CardTitle>
            <CardDescription>
              Manage your personal information and account settings.
            </CardDescription>
            <PilotBadge />
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                />
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={isLocked}
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
                    <Input value={license} disabled />
                  </div>

                  <div>
                    <Label>Vehicle Number</Label>
                    <Input value={vehicleNumber} disabled />
                  </div>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Logout</Button>
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
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving || isLocked}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
