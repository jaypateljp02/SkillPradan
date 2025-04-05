import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  // Validate that we have the minimum required configuration
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error("Firebase API key is missing");
  }
  if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    throw new Error("Firebase auth domain is missing");
  }
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error("Firebase project ID is missing");
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Display a more prominent error in development to ensure Firebase is properly configured
  if (import.meta.env.DEV) {
    console.error(
      "%c Firebase Authentication Error ",
      "background: #ff0000; color: white; font-size: 16px; font-weight: bold; padding: 4px;"
    );
    console.error(
      "%c Firebase environment variables must be properly configured for authentication to work.",
      "font-size: 14px; font-weight: bold;"
    );
  }
}

// Export Firebase instances
export { app, auth };
export default app;