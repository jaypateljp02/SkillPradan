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
  
  // Listen for Firebase auth state changes and handle token refresh
  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth not initialized");
      setFirebaseLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Firebase auth state changed", user ? `User: ${user.email}` : "No user");
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Get a fresh ID token with each auth state change
          const token = await user.getIdToken(true);
          console.log("Firebase token refreshed successfully");
          
          // The token is automatically used by apiRequest through our queryClient setup
          // No need to store it manually
          
          // This will trigger a refetch of the user data with the new token
          if (!user.isAnonymous) {
            queryClient.invalidateQueries({queryKey: ["/api/user"]});
          }
        } catch (error) {
          console.error("Failed to refresh Firebase token:", error);
        }
      } else {
        // Clear cached data when user signs out
        queryClient.setQueryData(["/api/user"], null);
      }
      
      setFirebaseLoading(false);
    }, (error) => {
      // This is the error callback for onAuthStateChanged
      console.error("Firebase auth state change error:", error);
      setFirebaseLoading(false);
      
      toast({
        title: "Authentication Error",
        description: "There was a problem with your authentication. Please try logging in again.",
        variant: "destructive",
      });
    });
    
    return () => unsubscribe();
  }, [toast]);

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
        
        // No automatic redirect - user can stay on the logged-in screen
        console.log("Registration successful, user can navigate the app now");
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
        
        // No automatic redirect - user can stay on the logged-in screen
        console.log("Login successful, user can navigate the app now");
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
      // Prepare for logout
      const wasAuthenticated = auth?.currentUser != null;
      console.log("Starting logout process, user authenticated:", wasAuthenticated);
      
      // First try logout from our backend (this may fail if backend session was lost)
      // Use try-catch inside to continue with Firebase logout even if backend logout fails
      try {
        await apiRequest("POST", "/api/firebase-logout");
        console.log("Backend logout successful");
      } catch (backendError) {
        console.warn("Backend logout failed, continuing with Firebase logout:", backendError);
        // We'll continue with the Firebase logout even if backend logout fails
      }
      
      // Sign out from Firebase (if user was authenticated)
      if (auth) {
        await signOut(auth);
        console.log("Firebase sign out successful");
      }
      
      // Clear local user data no matter what happens above
      queryClient.setQueryData(["/api/user"], null);
      queryClient.resetQueries();
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      
      // Redirect to auth page after a brief moment 
      // (gives time for the toast to be seen)
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error("Firebase logout error:", error);
      
      toast({
        title: "Logout failed",
        description: "There was an issue with logout. Click the logout button again to retry.",
        variant: "destructive",
      });
      
      // We'll allow the higher-level function to decide what to do with the error
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
  const logout = async () => {
    try {
      console.log("Logging out user...");
      // Always use Firebase logout
      await context.firebaseLogout();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // If the regular logout fails, try a manual cleanup
      if (window.confirm("Logout encountered an error. Would you like to force logout?")) {
        queryClient.clear();
        window.location.href = "/auth";
      }
    }
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
