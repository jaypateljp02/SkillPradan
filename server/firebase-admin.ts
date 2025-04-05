import * as admin from 'firebase-admin';
import { storage } from './storage';

// This is a circular import issue, so we'll define a local map to prevent it
// and the firebaseAuth module will expose the real one
const localFirebaseUsers = new Map<string, number>();

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

try {
  // Check if we have all the required environment variables
  if (
    !process.env.FIREBASE_PROJECT_ID
  ) {
    console.warn(
      'Firebase Admin SDK initialization failed: Missing environment variables. ' +
      'Some Firebase authentication features may not work properly.'
    );
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

  // Initialize the admin SDK using service account or default credentials
  // We'll first try to initialize using the FIREBASE_* environment variables
  try {
    firebaseApp = admin.initializeApp({
      // Use application default credentials
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (initError) {
    // Fall back to initializing with just the project ID
    // This is a simpler approach that will work for development
    console.warn('Falling back to simplified Firebase Admin initialization');
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

/**
 * Verifies a Firebase ID token and returns the Firebase UID if valid
 */
export async function verifyFirebaseToken(idToken: string): Promise<string | null> {
  if (!firebaseApp) {
    console.error('Firebase Admin SDK not initialized');
    return null;
  }

  try {
    const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}

/**
 * Tries to get user data from Firebase Auth and sync it with our database
 */
export async function syncUserWithFirebase(firebaseUid: string): Promise<number | null> {
  if (!firebaseApp) {
    console.error('Firebase Admin SDK not initialized');
    return null;
  }

  try {
    // Check if we already have a mapping for this Firebase UID
    let userId = localFirebaseUsers.get(firebaseUid);
    if (userId) {
      return userId;
    }

    // Get user data from Firebase Auth
    const userRecord = await firebaseApp.auth().getUser(firebaseUid);
    
    if (!userRecord.email) {
      console.error('User has no email in Firebase');
      return null;
    }

    // In a real implementation, we would search for users with the same email
    // Since our storage doesn't have this method, we'll just return null
    // indicating that the user needs to register first
    return null;
  } catch (error) {
    console.error('Error syncing user with Firebase:', error);
    return null;
  }
}

export default firebaseApp;