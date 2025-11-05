'use client';

import { usePathname } from 'next/navigation';
import { Chatbot } from './chatbot';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      {children}
      {!isDashboard && <Chatbot />}
    </>
  );
}
