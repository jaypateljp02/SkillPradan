import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, setToken, removeToken } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{user: SelectUser, token: string}, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{user: SelectUser, token: string}, Error, InsertUser>;
  logout?: () => void; // Added this to fix the type issue
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
        const data = await res.json();
        console.log("Login successful, received data:", data);
        
        // Store the token
        if (data.token) {
          console.log("Storing authentication token");
          setToken(data.token);
        } else {
          console.error("No token received from login");
        }
        
        // Verify token is working by making a request to user endpoint
        const verifyToken = async () => {
          try {
            const checkRes = await fetch("/api/debug/token", {
              headers: {
                "Authorization": `Bearer ${data.token}`
              },
              cache: "no-cache"
            });
            
            if (checkRes.ok) {
              const tokenData = await checkRes.json();
              console.log("Token verification data:", tokenData);
              
              if (!tokenData.authenticated) {
                console.error("Token not valid after login!");
              }
            } else {
              console.error("Token verification failed:", checkRes.status);
            }
          } catch (e) {
            console.error("Failed to verify token after login:", e);
          }
        };
        
        await verifyToken();
        return data;
      } catch (error) {
        console.error("Login mutation function error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
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
        const data = await res.json();
        console.log("Registration successful, received data:", data);
        
        // Store the token
        if (data.token) {
          console.log("Storing authentication token");
          setToken(data.token);
        } else {
          console.error("No token received from registration");
        }
        
        return data;
      } catch (error) {
        console.error("Registration mutation function error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Account created",
        description: `Welcome to Skill प्रदान, ${data.user.name}!`,
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
        
        // Remove the token
        removeToken();
        
        // Clear client-side cache completely
        queryClient.clear();
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
  
  // Add a simple logout function that triggers the logoutMutation
  const logout = () => {
    context.logoutMutation.mutate();
  };
  
  return {
    ...context,
    logout
  };
}
