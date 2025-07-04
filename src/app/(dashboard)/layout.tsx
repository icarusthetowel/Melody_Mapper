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
import { StudentsProvider } from '@/contexts/StudentsContext';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      setRole(userRole);
      if (userRole === 'teacher') {
          const userEmail = localStorage.getItem('userEmail');
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const foundUser = users.find((u: any) => u.email === userEmail);
           if(foundUser) {
             setUser({name: foundUser.fullName, email: foundUser.email});
          }
      } else if(userRole === 'admin') {
          setUser({name: 'Admin', email: 'admin@melody.com'});
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
  const getDisplayName = () => user?.name || 'User';
  const getEmail = () => user?.email || '';

  return (
    <StudentsProvider>
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
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person smiling" />
                  <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{getDisplayName()}</p>
                  <p className="text-sm text-muted-foreground truncate">{getEmail()}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="flex-shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="grid grid-cols-3 items-center p-4 bg-card md:bg-transparent md:border-b">
              <div className="md:hidden">
                  <SidebarTrigger />
              </div>
              <div className='col-start-2 col-span-1 text-center'>
                  <h1 className="text-xl font-bold font-headline">Store 723</h1>
              </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </StudentsProvider>
  );
}
