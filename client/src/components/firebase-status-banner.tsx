import React, { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export function FirebaseStatusBanner() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is initialized
    if (!auth) {
      setError("Firebase SDK not initialized");
      setInitialized(false);
      return;
    }

    setInitialized(true);

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      if (user) {
        console.log("Firebase user signed in:", user.email);
      } else {
        console.log("No Firebase user signed in");
      }
    }, (authError) => {
      console.error("Firebase auth error:", authError);
      setError(authError.message);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Firebase Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!initialized) {
    return (
      <Alert className="mb-4">
        <AlertTitle>Firebase Status</AlertTitle>
        <AlertDescription className="flex items-center">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mr-2">Initializing</Badge>
          Waiting for Firebase SDK to initialize...
        </AlertDescription>
      </Alert>
    );
  }

  if (firebaseUser) {
    return (
      <Alert className="mb-4">
        <AlertTitle>Firebase Status</AlertTitle>
        <AlertDescription className="flex items-center">
          <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">Connected</Badge>
          Signed in as {firebaseUser.email}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <AlertTitle>Firebase Status</AlertTitle>
      <AlertDescription className="flex items-center">
        <Badge variant="outline" className="bg-blue-100 text-blue-800 mr-2">Ready</Badge>
        Firebase initialized, but no user is signed in
      </AlertDescription>
    </Alert>
  );
}