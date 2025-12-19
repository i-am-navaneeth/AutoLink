'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userType, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userType !== 'admin') {
      router.replace('/login');
    }
  }, [loading, userType, router]);

  if (loading || userType !== 'admin') return null;

  return <>{children}</>;
}
