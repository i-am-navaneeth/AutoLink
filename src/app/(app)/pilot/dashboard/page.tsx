'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  IndianRupee,
  Car,
  Calendar,
  Gift,
  ChevronDown,
} from 'lucide-react';
import { useUser } from '@/context/user-context';

type RecentRide = {
  id: string;
  fare: number;
  created_at: string;
  ride_type: string | null;
};

const REFERRAL_LIMIT = 30;

export default function PilotDashboardPage() {
  const { userType, pilotVerificationStatus, loading } = useUser();

  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [avgPerRide, setAvgPerRide] = useState(0);

  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);

  const [freeDays, setFreeDays] = useState(0);
  const [usedReferrals, setUsedReferrals] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const [showMore, setShowMore] = useState(false);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  if (userType !== 'pilot') return null;


  /* ================= LOAD DATA ================= */
  useEffect(() => {
    let mounted = true;

    const generateReferralCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const loadData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user || !mounted) return;

      const pilotUserId = auth.user.id;

      const { data: credits } = await supabase
        .from('pilot_credits')
        .select('free_days, used_referrals')
        .eq('pilot_id', pilotUserId)
        .maybeSingle();

      if (mounted) {
        setFreeDays(credits?.free_days ?? 0);
        setUsedReferrals(credits?.used_referrals ?? 0);
      }

      const { data: pilotRow } = await supabase
  .from('pilots')
  .select('id, referral_code')
  .eq('id', pilotUserId)
  .eq('verification_status', 'approved')
  .maybeSingle();


      let code = pilotRow?.referral_code ?? null;

      if (!code && pilotRow?.id) {
        const newCode = generateReferralCode();
        const { error } = await supabase
          .from('pilots')
          .update({ referral_code: newCode })
          .eq('id', pilotRow.id);

        if (!error) code = newCode;
      }

      if (mounted) setReferralCode(code);

      const now = new Date();
      const today = now.toISOString().slice(0, 10);

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const { data: rides } = await supabase
        .from('rides')
        .select('fare, created_at')
        .eq('pilot_id', pilotUserId)
        .eq('status', 'completed');

      const safeRides = rides || [];
      const sum = (arr: typeof safeRides) =>
        arr.reduce((s, r) => s + (r.fare || 0), 0);

      if (mounted) {
        setTodayEarnings(
          sum(safeRides.filter(r => r.created_at?.slice(0, 10) === today))
        );
        setWeekEarnings(
          sum(safeRides.filter(r => new Date(r.created_at) >= weekStart))
        );
        setMonthEarnings(
          sum(safeRides.filter(r => new Date(r.created_at) >= monthStart))
        );
        setTotalRides(safeRides.length);
        setAvgPerRide(
          safeRides.length
            ? Math.round(sum(safeRides) / safeRides.length)
            : 0
        );
      }

      const { data: recent } = await supabase
        .from('rides')
        .select('id, fare, created_at, ride_type')
        .eq('pilot_id', pilotUserId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (mounted) setRecentRides(recent || []);
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  /* ================= NOT APPROVED ================= */
  if (pilotVerificationStatus !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <Card className="border-yellow-400 bg-yellow-50">
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>
              Upload documents to continue
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  /* ================= REFERRAL HELPERS ================= */
  const referralLimitReached = usedReferrals >= REFERRAL_LIMIT;
  const remainingReferrals = Math.max(
    REFERRAL_LIMIT - usedReferrals,
    0
  );

  const handleShareWhatsApp = () => {
    if (!referralCode || referralLimitReached) return;

    const message = encodeURIComponent(
      `Join AutoLink 🚕\n\nUse my referral code *${referralCode}* while signing up and get benefits.\n\nDownload 👉 https://autolinkapp.in`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  /* ================= DASHBOARD ================= */
  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">
      <h1 className="text-2xl font-bold">Pilot Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <IndianRupee /> Today
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ₹{todayEarnings}
          </CardContent>
        </Card>

        <Card className="border-blue-400">
          <CardHeader className="flex items-center gap-2">
            <Gift /> Referrals
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Free Days</span>
              <span className="font-semibold text-green-600">
                {freeDays}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Successful</span>
              <span>
                {usedReferrals}/{REFERRAL_LIMIT}
              </span>
            </div>

            {referralCode && (
              <div className="rounded-lg border p-3 bg-muted space-y-2">
                <p className="text-xs text-muted-foreground">
                  Your referral code
                </p>
                <p className="text-lg font-bold tracking-wider">
                  {referralCode}
                </p>

                {!referralLimitReached && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {remainingReferrals} referrals left
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleShareWhatsApp}
                    >
                      Share on WhatsApp
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setShowMore(v => !v)}
      >
        View More Stats
        <ChevronDown
          className={`transition-transform ${
            showMore ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {showMore && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Calendar /> This Week
              </CardHeader>
              <CardContent className="text-xl font-bold">
                ₹{weekEarnings}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Calendar /> This Month
              </CardHeader>
              <CardContent className="text-xl font-bold">
                ₹{monthEarnings}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Car /> Total Rides
              </CardHeader>
              <CardContent className="text-xl font-bold">
                {totalRides}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <IndianRupee /> Avg / Ride
            </CardHeader>
            <CardContent className="text-xl font-bold">
              ₹{avgPerRide}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
