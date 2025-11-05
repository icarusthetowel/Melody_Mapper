import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Chatbot } from '@/components/chatbot';

export const metadata: Metadata = {
  title: 'Melody Mapper',
  description: 'Log and track progress for your music students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.React.Object;
}>) {
  // A bit of a hack to check if the dashboard layout is a parent
  const isDashboard = (children as any).props.childProp.segment === '(dashboard)';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen')} suppressHydrationWarning>
        {children}
        <Toaster />
        {!isDashboard && <Chatbot />}
      </body>
    </html>
  );
}
