'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { pilotDashboardData } from '@/lib/data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { CheckCircle, Crown, IndianRupee, Trophy } from 'lucide-react';
import type { MonthlyEarning } from '@/lib/types';
import { useUser } from '@/context/user-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const chartData: MonthlyEarning[] = pilotDashboardData.monthlyEarningsData;
const chartConfig = {
  earnings: {
    label: 'Earnings',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function PilotDashboardPage() {
    const { userType } = useUser();
    const router = useRouter();

    useEffect(() => {
        if(userType && userType !== 'pilot') {
            router.push('/home');
        }
    }, [userType, router]);


  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">Pilot Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{pilotDashboardData.todayEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rides Completed (Today)</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pilotDashboardData.ridesCompleted}</div>
              <p className="text-xs text-muted-foreground">+5 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{pilotDashboardData.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">June 2024</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-earnings)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-amber-500" />
                Subscription Plan
              </CardTitle>
              <CardDescription>Manage your AutoLink subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card className="bg-secondary">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="font-semibold">Daily Plan</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </CardHeader>
                </Card>
                <p className="text-sm text-muted-foreground">
                    Choose a plan that works for you. Cancel anytime.
                </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Button variant="outline" className="h-auto flex-col p-4">
                        <span className="font-bold text-lg">₹9 / day</span>
                        <span className="text-xs text-muted-foreground">Daily Plan</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col p-4">
                        <span className="font-bold text-lg">₹249 / month</span>
                        <span className="text-xs text-muted-foreground">Monthly Plan</span>
                    </Button>
                 </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full">Upgrade to Yearly Plan (Save 20%)</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
