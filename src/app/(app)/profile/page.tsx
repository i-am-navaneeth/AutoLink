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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= APPLY REFERRAL (ONCE, SILENT) ================= */
  useEffect(() => {
    if (!authUser) return;

    const applyReferralOnce = async () => {
      const code = localStorage.getItem('pending_referral_code');
      if (!code) return;

      try {
        await fetch('/api/referrals/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: code }),
        });
      } catch {
        // silent fail — never block UX
      } finally {
        localStorage.removeItem('pending_referral_code');
      }
    };

    applyReferralOnce();
  }, [authUser]);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    if (!authUser) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('full_name, phone, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!data) return;

      setFullName(data.full_name ?? '');
      setMobile(data.phone ?? '');
      setAvatarUrl(data.avatar_url ?? null);
    };

    loadProfile();
  }, [authUser]);

  /* ---------------- AVATAR UPLOAD ---------------- */
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
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone: mobile,
        })
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

  return (
    <AppLayout>
      <div className="max-w-3xl">
        {/* UI unchanged */}
      </div>
    </AppLayout>
  );
}
