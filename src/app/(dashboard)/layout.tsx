'use client';

import type { PropsWithChildren } from 'react';
import { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardNav } from '@/components/dashboard-nav';
import { Music2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Prevents redirect flicker on initial load
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      setRole(userRole);
    } else {
      router.push('/'); // Redirect to login if no role is set
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const getEmail = () => {
    if (role === 'admin') return 'admin@melody.com';
    if (role === 'teacher') return 'user@melody.com';
    return '';
  }
  
  const getDisplayName = () => {
    if (role === 'admin') return 'Admin';
    if (role === 'teacher') return 'Student/Teacher';
    return 'User';
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline">
                Melody Mapper
              </h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person smiling" />
              <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{getDisplayName()}</p>
              <p className="text-sm text-muted-foreground">{getEmail()}</p>
            </div>
          </div>
           <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
             <LogOut className="mr-2 h-4 w-4" />
             Logout
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-card md:bg-transparent md:border-b">
            <div className="md:hidden">
                 <SidebarTrigger />
            </div>
            <div className='flex-1 text-center md:text-left'>
                {/* Optional Header Content */}
            </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
