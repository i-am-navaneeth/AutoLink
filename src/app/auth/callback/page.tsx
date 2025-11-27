'use client';
import { useSearchParams } from 'next/navigation';
export default function CallbackPage() {
  const searchParams = useSearchParams();
  // ...use searchParams.get('code') etc
}
