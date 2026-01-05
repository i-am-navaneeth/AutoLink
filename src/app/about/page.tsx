'use client';

import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card>

          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              <strong>AutoLink</strong> is a ride-sharing platform built with a
              simple goal — to make local travel faster, fairer, and more
              accessible.
            </p>

            <p>
              Unlike traditional ride apps, AutoLink focuses on transparency,
              low daily costs for pilots, and a smooth experience for passengers.
            </p>

            <p>
              This app is currently in its early stage. New features like live
              tracking, better route optimization, and smart pricing are coming
              soon.
            </p>

            <p className="text-muted-foreground">
              Built with ❤️ using Next.js, Supabase, and Google Maps.
            </p>

            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} AutoLink. All rights reserved.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Signature – Footer only (this is OK to keep) */}
      <div className="mt-20 mb-6 flex items-center justify-center text-center select-none">
        <p
          className="text-[12px] sm:text-[13px] font-medium text-[#8A8D94]"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <span className="font-semibold text-[#6B6F76]">AutoLink</span>
          <span className="mx-2">•</span>
          <span className="text-[#9A9CA3]">where tech meets tuktuk</span>
        </p>
      </div>
    </AppLayout>
  );
}
