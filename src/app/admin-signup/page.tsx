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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_CODE = 'ADMIN123';

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState('');

  const handleSignup = () => {
    if (code === ADMIN_CODE) {
      localStorage.setItem('userRole', 'admin');
      router.push('/dashboard');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid admin code.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-4">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Music2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your Melody Mapper admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Admin User" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="admin-code">Admin Code</Label>
                <Input 
                  id="admin-code" 
                  type="password" 
                  required 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
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
