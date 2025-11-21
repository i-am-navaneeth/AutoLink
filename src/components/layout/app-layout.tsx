'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';
import { useRouter } from 'next/navigation';
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
  LogOut,
  Map,
  Rocket,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mockPassenger, mockPilot } from '@/lib/data';
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const NavLink = ({
  href,
  children,
  onClick: customOnClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const { isSearching, setIsSearching } = useUser();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleNavigate = (e: React.MouseEvent) => {
    if (customOnClick) {
      customOnClick(e);
      return;
    }
    
    if (isSearching) {
      e.preventDefault();
      setShowDialog(true);
    } else {
      router.push(href);
    }
  };

  const confirmNavigation = () => {
    setIsSearching(false);
    setShowDialog(false);
    router.push(href);
  };

  return (
    <>
      <div onClick={handleNavigate} className="cursor-pointer">
        {children}
      </div>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ride Search?</AlertDialogTitle>
            <AlertDialogDescription>
              Leaving this page will cancel your current ride search. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>Yes, Cancel Search</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


const PassengerNav = () => {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <NavLink href="/home">
          <SidebarMenuButton
            isActive={pathname.startsWith('/home')}
            tooltip="Home"
          >
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
          <SidebarMenuButton
            isActive={pathname.startsWith('/profile')}
            tooltip="My Profile"
          >
            <UserIcon />
            <span>My Profile</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

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
          <SidebarMenuButton
            isActive={pathname.startsWith('/profile')}
            tooltip="My Profile"
          >
            <UserIcon />
            <span>My Profile</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </>
  );
};

// A new nav item for admins
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
    )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { userType, logout, isSearching, setIsSearching } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userType) {
      router.push('/');
    }
  }, [userType, router]);


  if (!userType) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 animate-pulse" />
                <p className="text-lg">Loading AutoLink...</p>
            </div>
        </div>
    );
  }

  // A simple way to handle admin role, you might have a more robust system
  const isAdmin = userType === 'pilot'; // For demo, let's say pilots are also admins
  const currentUser = userType === 'passenger' ? mockPassenger : mockPilot;

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center justify-center text-center p-4">
             <h2 className="font-bold text-2xl text-sidebar-foreground font-headline group-data-[collapsible=icon]:hidden">
                AutoLink
             </h2>
             <h2 className="font-bold text-xl text-sidebar-foreground font-headline hidden group-data-[collapsible=icon]:block">
                AL
             </h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {userType === 'passenger' ? <PassengerNav /> : <PilotNav />}
            {isAdmin && <AdminNav />}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="items-center">
            <Separator className="mb-2" />
            <div className="flex items-center gap-3 w-full p-2">
            <Avatar>
                <AvatarImage src={currentUser.avatarUrl} />
                <AvatarFallback>
                {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <h2 className="font-bold text-2xl text-foreground font-headline">AutoLink</h2>
            <SidebarTrigger />
        </header>
        <main className='p-4 sm:p-6 lg:p-8'>
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
