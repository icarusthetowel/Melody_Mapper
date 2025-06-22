'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Music2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'teacher') => {
    localStorage.setItem('userRole', role);
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-4">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
                <Music2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Welcome back to Melody Mapper
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button onClick={() => handleLogin('teacher')} className="w-full">
                Student / Teacher Login
              </Button>
              <Button onClick={() => router.push('/admin-login')} variant="outline" className="w-full">
                Admin Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
             <div className="mt-2 text-center text-sm">
              <Link href="/admin-signup" className="underline">
                Sign up as Admin
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
