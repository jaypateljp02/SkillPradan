import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login with credentials:", credentials.username);
        const res = await apiRequest("POST", "/api/login", credentials);
        const userData = await res.json();
        console.log("Login successful, received user data:", userData);
        
        // Wait for session cookie to be properly set
        const verifySession = async () => {
          try {
            const checkRes = await fetch("/api/debug/session", {
              credentials: "include",
              cache: "no-cache",
              mode: "same-origin",
            });
            
            const sessionData = await checkRes.json();
            console.log("Session verification data:", sessionData);
            
            if (!sessionData.authenticated) {
              console.error("Session not authenticated after login!");
            }
          } catch (e) {
            console.error("Failed to verify session after login:", e);
          }
        };
        
        await verifySession();
        return userData;
      } catch (error) {
        console.error("Login mutation function error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
      
      // Force query cache invalidation to ensure fresh data
      queryClient.invalidateQueries();
      
      // Add a slight delay to ensure state is updated before redirect
      setTimeout(() => {
        // Redirect to the groups page after successful login
        window.location.href = "/groups";
      }, 500);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your username and password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        console.log("Attempting registration for:", credentials.username);
        const res = await apiRequest("POST", "/api/register", credentials);
        const userData = await res.json();
        console.log("Registration successful, received user data:", userData);
        
        // Verify session was created after registration
        const verifySession = async () => {
          try {
            const checkRes = await fetch("/api/debug/session", {
              credentials: "include",
              cache: "no-cache",
              mode: "same-origin",
            });
            
            const sessionData = await checkRes.json();
            console.log("Session verification data after registration:", sessionData);
            
            if (!sessionData.authenticated) {
              console.error("Session not authenticated after registration!");
            }
          } catch (e) {
            console.error("Failed to verify session after registration:", e);
          }
        };
        
        await verifySession();
        return userData;
      } catch (error) {
        console.error("Registration mutation function error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: `Welcome to Skill प्रदान, ${user.name}!`,
      });
      
      // Force query cache invalidation to ensure fresh data
      queryClient.invalidateQueries();
      
      // Add a slight delay to ensure state is updated before redirect
      setTimeout(() => {
        // Redirect to the groups page after successful registration
        window.location.href = "/groups";
      }, 500);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting to log out");
        await apiRequest("POST", "/api/logout");
        
        // Clear client-side cache completely
        queryClient.clear();
        
        // Verify session was cleared after logout
        const verifySession = async () => {
          try {
            const checkRes = await fetch("/api/debug/session", {
              credentials: "include",
              cache: "no-cache",
              mode: "same-origin",
            });
            
            const sessionData = await checkRes.json();
            console.log("Session verification data after logout:", sessionData);
            
            if (sessionData.authenticated) {
              console.error("Session still authenticated after logout!");
            }
          } catch (e) {
            console.error("Failed to verify session after logout:", e);
          }
        };
        
        await verifySession();
      } catch (error) {
        console.error("Logout mutation function error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Update local cache state
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      
      // Redirect to login page after logout
      setTimeout(() => {
        window.location.href = "/auth";
      }, 300);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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
  return context;
}
