import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  // Validate that the config has the minimum required properties
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
    throw new Error("Firebase API key is missing");
  }
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain === "undefined") {
    throw new Error("Firebase auth domain is missing");
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "undefined") {
    throw new Error("Firebase project ID is missing");
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully with config:", 
    { projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain });
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Display a more prominent error in development to ensure Firebase is properly configured
  if (import.meta.env.DEV) {
    console.error(
      "%c Firebase Authentication Error ",
      "background: #ff0000; color: white; font-size: 16px; font-weight: bold; padding: 4px;"
    );
    console.error(
      "%c Firebase configuration: ",
      "font-size: 14px; font-weight: bold;",
      {
        apiKey: firebaseConfig.apiKey ? "Defined" : "Missing",
        authDomain: firebaseConfig.authDomain ? "Defined" : "Missing",
        projectId: firebaseConfig.projectId ? "Defined" : "Missing"
      }
    );
  }
}

// Get Firebase ID token for authentication
export async function getFirebaseIdToken(): Promise<string | null> {
  try {
    if (!auth || !auth.currentUser) {
      console.warn("No authenticated user found");
      return null;
    }
    
    const token = await auth.currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error("Error getting Firebase ID token:", error);
    return null;
  }
}

// Authentication helper functions
export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase auth not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase auth not initialized");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOut() {
  if (!auth) throw new Error("Firebase auth not initialized");
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) throw new Error("Firebase auth not initialized");
  return onAuthStateChanged(auth, callback);
}

// Export Firebase instances
export { app, auth };
export default app;