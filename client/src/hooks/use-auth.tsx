import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../lib/firebase";

type FirebaseLoginData = {
  email: string;
  password: string;
};

type FirebaseRegisterData = FirebaseLoginData & {
  username: string;
  name: string;
  university: string;
};

type AuthContextType = {
  user: SelectUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
  // Firebase authentication
  firebaseRegister: (data: FirebaseRegisterData) => Promise<void>;
  firebaseLogin: (data: FirebaseLoginData) => Promise<void>;
  firebaseLogout: () => Promise<void>;
  // Helper method
  logout?: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setFirebaseLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
      
      if (user) {
        console.log("Firebase user signed in:", user.email);
      } else {
        console.log("Firebase user signed out");
      }
    });
    
    return () => unsubscribe();
  }, []);

  const {
    data: user,
    error, 
    isLoading: apiLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Combine loading states from Firebase and API
  const isLoading = firebaseLoading || apiLoading;
  
  // Firebase authentication functions
  const firebaseRegister = async (data: FirebaseRegisterData) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth!, 
        data.email, 
        data.password
      );
      
      // If successful, create a user in our backend system
      if (userCredential.user) {
        const res = await apiRequest("POST", "/api/firebase-register", {
          firebaseUid: userCredential.user.uid,
          email: data.email,
          username: data.username,
          name: data.name,
          university: data.university
        });
        
        const userData = await res.json();
        
        // Update the user data in our cache
        queryClient.setQueryData(["/api/user"], userData.user);
        
        toast({
          title: "Account created",
          description: `Welcome to Skill प्रदान, ${userData.user.name}!`,
        });
        
        // Redirect to home page with a longer delay to ensure data is loaded
        console.log("Registration successful, redirecting to home page shortly");
        // Increase timeout to allow WebSocket connections to establish
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      
      // If Firebase throws an error, sign out the user
      if (auth) {
        try {
          await signOut(auth);
        } catch (logoutError) {
          console.error("Error signing out after failed registration:", logoutError);
        }
      }
      
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  const firebaseLogin = async (data: FirebaseLoginData) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth!,
        data.email,
        data.password
      );
      
      // If successful, fetch user data from our backend
      if (userCredential.user) {
        const res = await apiRequest("POST", "/api/firebase-login", {
          firebaseUid: userCredential.user.uid
        });
        
        const userData = await res.json();
        
        // Update the user data in our cache
        queryClient.setQueryData(["/api/user"], userData.user);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData.user.name}`,
        });
        
        // Redirect to home page with a longer delay to ensure data is loaded
        console.log("Login successful, redirecting to home page shortly");
        // Increase timeout to allow WebSocket connections to establish
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error: any) {
      console.error("Firebase login error:", error);
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password",
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  const firebaseLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth!);
      
      // Sign out from our backend
      await apiRequest("POST", "/api/firebase-logout");
      
      // Clear the user data cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      
      // Redirect to auth page
      setTimeout(() => {
        window.location.href = "/auth";
      }, 300);
    } catch (error: any) {
      console.error("Firebase logout error:", error);
      
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        firebaseUser,
        isLoading,
        error,
        firebaseRegister,
        firebaseLogin,
        firebaseLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Firebase logout function
  const logout = () => {
    // Always use Firebase logout
    context.firebaseLogout();
  };
  
  // Determine if the user is an admin
  const isAdmin = context.user?.isAdmin || false;
  
  return {
    ...context,
    logout,
    isAdmin,
    // Helper to check if user is authenticated
    isAuthenticated: !!(context.user || context.firebaseUser)
  };
}
