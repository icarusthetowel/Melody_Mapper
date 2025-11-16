import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { StudentProvider } from '@/context/StudentContext'
import AppWrapper from '@/components/AppWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Melody Mapper',
  description: 'Your personal music practice assistant.',
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StudentProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </StudentProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}