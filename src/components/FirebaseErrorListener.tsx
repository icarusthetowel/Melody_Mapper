'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

// This component is a hack to get errors from the global event emitter
// into the Next.js error overlay. The overlay only works for uncaught exceptions.
function throwError(error: Error) {
  setTimeout(() => {
    throw error;
  }, 0);
}

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.log("Caught Firestore Permission Error:", error.message);
      
      // In a production environment, you would show a toast or a less intrusive error.
      // For development, we want the full Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
         throwError(error);
      } else {
         toast({
            title: "Permission Denied",
            description: "You do not have permission to perform this action.",
            variant: "destructive"
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  // This component doesn't render anything.
  return null;
}
