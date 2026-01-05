'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/context/user-context';

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
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Settings,
} from 'lucide-react';

import { Separator } from '../ui/separator';

/* ---------------- NAV LINK ---------------- */

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
};

/* ---------------- PASSENGER NAV ---------------- */

const PassengerNav = () => {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/home">
          <SidebarMenuButton isActive={pathname.startsWith('/home')}>
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/quick-rides">
          <SidebarMenuButton isActive={pathname.startsWith('/quick-rides')}>
            <Rocket />
            <span>Quick Rides</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/settings">
          <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

/* ---------------- PILOT NAV ---------------- */

const PilotNav = () => {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/pilot/home">
          <SidebarMenuButton isActive={pathname.startsWith('/pilot/home')}>
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/pilot/dashboard">
          <SidebarMenuButton isActive={pathname.startsWith('/pilot/dashboard')}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/settings">
          <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

/* ---------------- ADMIN NAV ---------------- */

const AdminNav = () => {
  const pathname = usePathname();

  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/admin/verify-pilots">
          <SidebarMenuButton
            isActive={pathname.startsWith('/admin/verify-pilots')}
          >
            <ShieldCheck />
            <span>Verify Pilots</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <NavLink href="/settings">
          <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

/* ---------------- MAIN LAYOUT (UI ONLY) ---------------- */

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userType, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user || !userType) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="items-center justify-center text-center p-4">
          <h2 className="font-bold text-2xl group-data-[collapsible=icon]:hidden">
            AutoLink
          </h2>
          <h2 className="font-bold text-xl hidden group-data-[collapsible=icon]:block">
            AL
          </h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {userType === 'passenger' && <PassengerNav />}
            {userType === 'pilot' && <PilotNav />}
            {userType === 'admin' && <AdminNav />}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <Separator className="mb-2" />
          <div
            onClick={() => router.push('/profile')}
            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-colors hover:bg-black/10"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback>
                {user.email?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-sm truncate text-white">
                {user.email}
              </p>
              <p className="text-xs text-black/70 truncate">
                {userType}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="p-4 sm:p-6 bg-white min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
