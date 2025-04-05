// This file provides Firebase configuration for the client
// We get these values from the environment at build time

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDMdwDJPX-Lo1XQANnjJaSoepbMS2Trn3c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skill-pradan.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skill-pradan",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skill-pradan.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "561228208858",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:561228208858:web:163c65d4ada5941210a3e3",
};

// Check if the config has been properly replaced at build time
export function hasValidFirebaseConfig(): boolean {
  return (
    firebaseConfig.apiKey !== "AIzaSyDMdwDJPX-Lo1XQANnjJaSoepbMS2Trn3c" &&
    firebaseConfig.authDomain !== "skill-pradan.firebaseapp.com" && 
    firebaseConfig.projectId !== "skill-pradan"
  );
}