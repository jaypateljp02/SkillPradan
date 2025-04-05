import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { firebaseConfig } from '@/lib/firebase-config';

export function FirebaseEnvDebug() {
  // Only show this component in development mode
  if (import.meta.env.PROD) {
    return null;
  }
  
  // Check if the firebaseConfig has valid values
  const configKeys = [
    { name: 'apiKey', value: firebaseConfig.apiKey },
    { name: 'authDomain', value: firebaseConfig.authDomain },
    { name: 'projectId', value: firebaseConfig.projectId },
    { name: 'storageBucket', value: firebaseConfig.storageBucket },
    { name: 'messagingSenderId', value: firebaseConfig.messagingSenderId },
    { name: 'appId', value: firebaseConfig.appId },
  ];
  
  const invalidKeys = configKeys.filter(k => 
    !k.value || 
    k.value === 'undefined' || 
    k.value === '__FIREBASE_API_KEY__' ||
    k.value.startsWith('__')
  );
  
  if (invalidKeys.length === 0) {
    return (
      <Alert className="mb-4 bg-green-50">
        <AlertTitle>Firebase Configuration</AlertTitle>
        <AlertDescription>
          All Firebase configuration values are properly set.
          <div className="text-xs mt-2 p-2 bg-gray-50 rounded">
            Project ID: {firebaseConfig.projectId}<br />
            Auth Domain: {firebaseConfig.authDomain}
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Firebase Configuration Issues</AlertTitle>
      <AlertDescription>
        <div className="text-sm mb-2">
          The following Firebase configuration values are missing or invalid:
        </div>
        <ul className="list-disc ml-5 mt-2">
          {invalidKeys.map(k => (
            <li key={k.name} className="text-sm">{k.name}</li>
          ))}
        </ul>
        <div className="mt-2 text-xs p-2 bg-gray-800 text-white rounded font-mono">
          {JSON.stringify(firebaseConfig, null, 2)}
        </div>
      </AlertDescription>
    </Alert>
  );
}