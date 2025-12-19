'use client';

import React, { useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { useRouter, usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Car,
  Home,
  LayoutDashboard,
  Rocket,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';

import Link from 'next/link';
import { Separator } from '../ui/separator';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------- NAV LINK ----------------

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <div onClick={() => router.push(href)} className="cursor-pointer">
      {children}
    </div>
  );
};

// ---------------- PASSENGER NAV ----------------

const PassengerNav = () => {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/home">
          <SidebarMenuButton isActive={pathname.startsWith('/home')} tooltip="Home">
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/quick-rides">
          <SidebarMenuButton
            isActive={pathname.startsWith('/quick-rides')}
            tooltip="Quick Rides"
          >
            <Rocket />
            <span>Quick Rides</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/profile">
          <SidebarMenuButton isActive={pathname.startsWith('/profile')} tooltip="My Profile">
            <UserIcon />
            <span>My Profile</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

// ---------------- PILOT NAV ----------------

const PilotNav = () => {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/home">
          <SidebarMenuButton isActive={pathname.startsWith('/home')} tooltip="Home">
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/pilot-dashboard">
          <SidebarMenuButton
            isActive={pathname.startsWith('/pilot-dashboard')}
            tooltip="Dashboard"
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/profile">
          <SidebarMenuButton isActive={pathname.startsWith('/profile')} tooltip="My Profile">
            <UserIcon />
            <span>My Profile</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

// ---------------- ADMIN NAV ----------------

const AdminNav = () => {
  const pathname = usePathname();
  return (
    <SidebarMenuItem>
      <NavLink href="/admin/verify-pilots">
        <SidebarMenuButton
          isActive={pathname.startsWith('/admin/verify-pilots')}
          tooltip="Verify Pilots"
        >
          <ShieldCheck />
          <span>Verify Pilots</span>
        </SidebarMenuButton>
      </NavLink>
    </SidebarMenuItem>
  );
};

// ---------------- MAIN LAYOUT ----------------

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, userType, loading } = useUser();

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // ⏳ Loading state
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Car className="h-8 w-8 animate-pulse" />
          <p className="text-lg">Loading AutoLink...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userType === 'admin';
  const isPassenger = userType === 'passenger';
  const isPilot = userType === 'pilot';

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center justify-center text-center p-4">
          <h2 className="font-bold text-2xl group-data-[collapsible=icon]:hidden">AutoLink</h2>
          <h2 className="font-bold text-xl hidden group-data-[collapsible=icon]:block">AL</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {isPassenger && <PassengerNav />}
            {isPilot && <PilotNav />}
            {isAdmin && <AdminNav />}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="items-center">
          <Separator className="mb-2" />

          <div className="flex items-center gap-3 w-full p-2">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {user.email?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="font-semibold truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{userType}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:hidden">
          <h2 className="font-bold text-2xl">AutoLink</h2>
          <SidebarTrigger />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
