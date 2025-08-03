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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const ADMIN_CODE = 'ADMIN123';

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (code !== ADMIN_CODE) {
      toast({
        title: 'Error',
        description: 'Invalid admin code.',
        variant: 'destructive',
      });
      return;
    }
    if (!fullName || !email || !password) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser = {
        fullName,
        email: firebaseUser.email!,
        role: 'admin' as const,
      };

      // commenting to push a redeployment 
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Admin signup error:', error);
      let description = error.message || 'An unknown error occurred.';

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description =
              'This email address is already in use by another account.';
            break;
          case 'auth/weak-password':
            description =
              'The password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/operation-not-allowed':
            description =
              'Email/Password sign-up is not enabled for this project. Please enable it in your Firebase console.';
            break;
          case 'auth/invalid-email':
            description = 'The email address is not valid.';
            break;
          case 'permission-denied':
            description =
              'Could not create user profile in the database. Please check your Firestore security rules.';
            break;
        }
      }

      // A more generic check for API key issues
      if (description.includes('API_KEY')) {
        description =
          "There's an issue with the app configuration. Please ensure your Firebase credentials are set up correctly in a .env file.";
      }

      toast({
        title: 'Signup Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
                <Input 
                  id="full-name" 
                  placeholder="Admin User" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="admin-code">Admin Code</Label>
                <Input 
                  id="admin-code" 
                  type="password" 
                  required 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleSignup} disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Account...' : 'Create an account'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/admin-login" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
