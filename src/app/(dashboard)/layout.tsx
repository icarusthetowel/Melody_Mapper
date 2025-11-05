
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
import { Music2, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { StudentsProvider } from '@/contexts/StudentsContext';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Chatbot } from '@/components/chatbot';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            // User exists in Auth but not in Firestore. This is an error state.
            await signOut(auth);
            router.push('/');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await signOut(auth);
          router.push('/');
        }
      } else {
        router.push('/');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <StudentsProvider currentUser={currentUser}>
      <FirebaseErrorListener />
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
                  <AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{currentUser.fullName}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
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
                  <h1 className="text-xl font-bold font-headline">Melody Mapper</h1>
              </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Chatbot isLoggedIn={true} />
    </StudentsProvider>
  );
}
