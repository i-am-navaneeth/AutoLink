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
import { Camera } from 'lucide-react';

export default function PilotProfilePage() {
  const { user: authUser, userType } = useUser();
  const { toast } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 🚫 Guard
  if (userType !== 'pilot') return null;

  // 🔽 Load pilot profile
  useEffect(() => {
    if (!authUser) return;

    supabase
      .from('users')
      .select('full_name, phone, license, vehicle_number, avatar_url')
      .eq('id', authUser.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setFullName(data.full_name ?? '');
        setPhone(data.phone ?? '');
        setLicense(data.license ?? '');
        setVehicleNumber(data.vehicle_number ?? '');
        setAvatarUrl(data.avatar_url ?? null);
      });
  }, [authUser]);

  // 📸 Avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!authUser) return;

    const ext = file.name.split('.').pop();
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

    await supabase.from('users').update({ avatar_url: url }).eq('id', authUser.id);
    setAvatarUrl(url);
  };

  // 💾 Save
  const handleSave = async () => {
    if (!authUser) return;

    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        license,
        vehicle_number: vehicleNumber,
      })
      .eq('id', authUser.id);

    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: error.message });
      return;
    }

    toast({ title: 'Pilot profile updated' });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Pilot Profile</CardTitle>
            <CardDescription>Manage pilot details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl ?? ''} />
                <AvatarFallback>
                  {authUser?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button size="icon" onClick={() => fileRef.current?.click()}>
                <Camera />
              </Button>

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleAvatarUpload(e.target.files[0])
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div>
                <Label>Mobile</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <Label>License Number</Label>
                <Input value={license} onChange={(e) => setLicense(e.target.value)} />
              </div>

              <div>
                <Label>Vehicle Number</Label>
                <Input
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
