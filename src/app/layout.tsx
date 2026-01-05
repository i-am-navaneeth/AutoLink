// src/app/layout.tsx
import './globals.css';
import React from 'react';
import Script from 'next/script';

import { UserProvider } from '@/context/user-context';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'AutoLink',
  description: 'Where tech meets tuktuk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
      </head>

      <body>
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
