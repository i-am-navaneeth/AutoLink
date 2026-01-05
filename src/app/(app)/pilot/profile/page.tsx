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
import { Camera, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PilotProfilePage() {
  const { user: authUser, userType, pilotVerificationStatus } = useUser();
  const { toast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 🚫 ROLE GUARD ONLY (NO REDIRECTS)
  if (userType !== 'pilot') return null;

  const isVerified = pilotVerificationStatus === 'approved';

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!authUser) return;

    supabase
      .from('users')
      .select('full_name, phone, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setAvatarUrl(data.avatar_url ?? null);
      });
  }, [authUser]);

  /* ================= AVATAR UPLOAD ================= */
  const handleAvatarUpload = async (file: File) => {
    if (!authUser) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Only JPG and PNG images are allowed',
      });
      return;
    }

    const path = `${authUser.id}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ variant: 'destructive', title: error.message });
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('users')
      .update({ avatar_url: url })
      .eq('id', authUser.id);

    setAvatarUrl(url);
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    if (!authUser) return;

    if (!avatarUrl) {
      toast({
        variant: 'destructive',
        title: 'Profile photo required',
        description: 'Please upload your profile photo',
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
      })
      .eq('id', authUser.id);

    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: error.message });
      return;
    }

    toast({ title: 'Profile updated successfully' });
  };

  /* ================= VERIFICATION BADGE ================= */
  const VerificationBadge = () => {
    if (pilotVerificationStatus === 'approved') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Verified
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
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pilot Profile</CardTitle>
            <CardDescription>Manage pilot details</CardDescription>
            <VerificationBadge />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl ?? ''} />
                <AvatarFallback>
                  {authUser?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                size="icon"
                onClick={() => fileRef.current?.click()}
              >
                <Camera />
              </Button>

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) =>
                  e.target.files && handleAvatarUpload(e.target.files[0])
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <Label>Mobile</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {isVerified && (
              <p className="text-xs text-muted-foreground">
                Verified pilots can still update basic profile details.
                For document changes, contact support.
              </p>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
