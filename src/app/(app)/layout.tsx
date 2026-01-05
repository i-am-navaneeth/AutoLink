'use client';

import React from 'react';
import { useUser } from '@/context/user-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useUser();

  // 🔒 CRITICAL GUARD
  if (loading) return null;
  if (!user) return null;

  return (
    <>
      <AppLayout>{children}</AppLayout>
      <Toaster />
    </>
  );
}
