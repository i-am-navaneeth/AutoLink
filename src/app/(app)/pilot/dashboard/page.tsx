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
} from 'lucide-react';
import { useUser } from '@/context/user-context';

type SubStatus = 'active' | 'expired' | 'unpaid' | 'none';

type RecentRide = {
  id: string;
  fare: number;
  created_at: string;
  ride_type: string | null;
};

export default function PilotDashboardPage() {
  const { userType, pilotVerificationStatus, loading } = useUser();

  /* ================= STATE ================= */

  // Earnings
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [avgPerRide, setAvgPerRide] = useState(0);

  // Recent rides
  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);

  // Subscription
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubStatus>('none');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Referrals
  const [freeDays, setFreeDays] = useState(0);
  const [usedReferrals, setUsedReferrals] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  /* ================= ROLE GUARD ================= */

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

    const loadData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user || !mounted) return;

      const pilotId = auth.user.id;

      /* ---------- REFERRAL CREDITS ---------- */
      const { data: credits } = await supabase
        .from('pilot_credits')
        .select('free_days, used_referrals')
        .eq('pilot_id', pilotId)
        .maybeSingle();

      if (mounted) {
        setFreeDays(credits?.free_days ?? 0);
        setUsedReferrals(credits?.used_referrals ?? 0);
      }

      /* ---------- REFERRAL CODE ---------- */
      const { data: pilot } = await supabase
        .from('pilots')
        .select('referral_code')
        .eq('user_id', pilotId)
        .single();

      if (mounted) {
        setReferralCode(pilot?.referral_code ?? null);
      }

      /* ---------- EARNINGS ---------- */
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
        .eq('pilot_id', pilotId)
        .eq('status', 'completed');

      const safeRides = rides || [];

      const sum = (arr: typeof safeRides) =>
        arr.reduce((s, r) => s + (r.fare || 0), 0);

      const todayArr = safeRides.filter(
        (r) => r.created_at?.slice(0, 10) === today
      );
      const weekArr = safeRides.filter(
        (r) => new Date(r.created_at) >= weekStart
      );
      const monthArr = safeRides.filter(
        (r) => new Date(r.created_at) >= monthStart
      );

      if (mounted) {
        setTodayEarnings(sum(todayArr));
        setWeekEarnings(sum(weekArr));
        setMonthEarnings(sum(monthArr));
        setTotalRides(safeRides.length);
        setAvgPerRide(
          safeRides.length
            ? Math.round(sum(safeRides) / safeRides.length)
            : 0
        );
      }

      /* ---------- RECENT RIDES ---------- */
      const { data: recent } = await supabase
        .from('rides')
        .select('id, fare, created_at, ride_type')
        .eq('pilot_id', pilotId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (mounted) {
        setRecentRides(recent || []);
      }

      /* ---------- SUBSCRIPTION ---------- */
      const { data: sub } = await supabase
        .from('pilot_subscriptions')
        .select('is_paid, expires_on')
        .eq('pilot_id', pilotId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (!sub) {
        setSubscriptionStatus('none');
      } else if (!sub.is_paid) {
        setSubscriptionStatus('unpaid');
      } else if (
        sub.expires_on &&
        new Date(sub.expires_on) < new Date()
      ) {
        setSubscriptionStatus('expired');
        setExpiryDate(sub.expires_on);
      } else {
        setSubscriptionStatus('active');
        setExpiryDate(sub.expires_on);
      }
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

  /* ================= DASHBOARD ================= */

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">
      <h1 className="text-2xl font-bold">Pilot Dashboard</h1>

      {/* 🎁 REFERRAL REWARDS */}
      <Card className="border-blue-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift /> Referral Rewards
          </CardTitle>
          <CardDescription>
            Share your code & earn free days
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Free Days</span>
            <span className="font-semibold text-green-600">
              {freeDays}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Successful Referrals</span>
            <span>{usedReferrals}</span>
          </div>

          {referralCode && (
            <div className="mt-3 rounded-lg border p-3 bg-muted">
              <p className="text-sm text-muted-foreground">
                Your referral code
              </p>
              <p className="text-lg font-bold tracking-wider">
                {referralCode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask friends to enter this code during signup.
                You’ll get 1 free day per referral.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📊 EARNINGS SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <IndianRupee /> Today
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{todayEarnings}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Calendar /> This Week
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{weekEarnings}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Calendar /> This Month
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{monthEarnings}
          </CardContent>
        </Card>
      </div>

      {/* 📈 TOTALS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Car /> Total Rides
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalRides}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <IndianRupee /> Avg / Ride
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{avgPerRide}
          </CardContent>
        </Card>
      </div>

      {/* 🧾 RECENT EARNINGS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>
            Last completed rides
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {recentRides.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No completed rides yet.
            </p>
          )}

          {recentRides.map((ride) => (
            <div
              key={ride.id}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  Ride #{ride.id.slice(0, 6)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    ride.created_at
                  ).toLocaleString()} •{' '}
                  {ride.ride_type ?? 'Quick Ride'}
                </p>
              </div>
              <div className="font-semibold text-green-600">
                ₹{ride.fare}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
