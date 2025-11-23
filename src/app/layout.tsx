// src/app/layout.tsx
import './globals.css';
import { UserProvider } from '@/context/user-context';
import React from 'react';

export const metadata = {
  title: 'AutoLink',
  description: 'AutoLink app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
