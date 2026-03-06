'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context';

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
import { Camera, CheckCircle, Clock, XCircle } from 'lucide-react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!authUser) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select(
          'full_name, phone, avatar_url, license_number, vehicle_number'
        )
        .eq('id', authUser.id)
        .maybeSingle();

      if (!data) return;

      setFullName(data.full_name ?? '');
      setMobile(data.phone ?? '');
      setAvatarUrl(data.avatar_url ?? null);
      setLicense(data.license_number ?? '');
      setVehicleNumber(data.vehicle_number ?? '');
    };

    loadProfile();
  }, [authUser]);

  /* ---------------- AVATAR ---------------- */
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

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSaveChanges = async () => {
    if (!authUser) return;

    setSaving(true);

    try {
      const updatePayload: any = {
        full_name: fullName,
        phone: mobile,
      };

      if (isPilot) {
        updatePayload.license_number = license;
        updatePayload.vehicle_number = vehicleNumber;
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', authUser.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Changes saved successfully.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description:
          err instanceof Error ? err.message : 'Something went wrong',
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

  if (!authUser) return null;

  return (
    <div className="max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Manage your personal information and account settings.
          </CardDescription>
          <PilotBadge />
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Avatar + Email */}
          <div className="flex items-center gap-6">
            <Avatar
              className="h-24 w-24 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback>
                {fullName?.charAt(0) || authUser.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-lg font-semibold">User</h3>
              <p className="text-muted-foreground">
                {authUser.email}
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>

          {/* FORM GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            {!isPilot && (
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input value={authUser.email ?? ''} disabled />
              </div>
            )}

            {isPilot && (
              <>
                <div className="space-y-2">
                  <Label>License</Label>
                  <Input
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vehicle Number</Label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>

          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}