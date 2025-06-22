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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = () => {
    // In a real app, you'd handle form validation and user creation here
    localStorage.setItem('userRole', 'teacher');
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
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for Melody Mapper
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
               <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button onClick={handleSignup} className="w-full">
                Create an account
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
