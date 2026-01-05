'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { User, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>
              Customize how AutoLink works for you
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PROFILE */}
            <div
              onClick={() => router.push('/profile')}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted transition"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span className="font-medium">Profile</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Edit your details
              </span>
            </div>

            {/* THEME (LOCKED TO LIGHT) */}
            <div className="space-y-2">
              <p className="font-medium">App Theme</p>

              <div className="flex gap-2">
                <Button disabled>Light</Button>
                <Button variant="outline" disabled>
                  Dark
                </Button>
                <Button variant="outline" disabled>
                  System
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Theme switching is currently disabled.
              </p>
            </div>

            {/* ABOUT */}
            <div
              onClick={() => router.push('/about')}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted transition"
            >
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5" />
                <span className="font-medium">About</span>
              </div>
              <span className="text-sm text-muted-foreground">
                App information
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
