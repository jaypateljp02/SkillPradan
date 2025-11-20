import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
  email: string;
  university?: string;
  avatar?: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  // Token-based authentication
  loginMutation: UseMutationResult<any, Error, LoginData, unknown>;
  registerMutation: UseMutationResult<any, Error, RegisterData, unknown>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const TOKEN_KEY = "auth_token";

// Helper to get token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Helper to set token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Helper to remove token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(getAuthToken());

  // Check for token on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const {
    data: user,
    error,
    isLoading: apiLoading,
    refetch: refetchUser,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!token, // Only fetch if we have a token
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(errorData.message || "Login failed");
      }

      const result = await res.json();
      
      // Store token
      if (result.token) {
        setAuthToken(result.token);
        setToken(result.token);
      }

      // Update user data in cache
      if (result.user) {
        queryClient.setQueryData(["/api/user"], result.user);
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
      });
      // Refetch user data to ensure we have the latest
      refetchUser();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your username and password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(errorData.message || "Registration failed");
      }

      const result = await res.json();
      
      // Store token
      if (result.token) {
        setAuthToken(result.token);
        setToken(result.token);
      }

      // Update user data in cache
      if (result.user) {
        queryClient.setQueryData(["/api/user"], result.user);
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Account created",
        description: `Welcome to Skill प्रदान, ${data.user.name}!`,
      });
      // Refetch user data to ensure we have the latest
      refetchUser();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
  });

  // Logout function
  const logout = async () => {
    try {
      const currentToken = getAuthToken();
      
      // Call logout endpoint if we have a token
      if (currentToken) {
        try {
          await apiRequest("POST", "/api/logout");
        } catch (error) {
          console.warn("Backend logout failed, continuing with local logout:", error);
        }
      }

      // Clear token
      removeAuthToken();
      setToken(null);

      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();

      toast({
        title: "Logged out",
        description: "Come back soon!",
      });

      // Redirect to auth page after a brief moment
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force logout even if API call fails
      removeAuthToken();
      setToken(null);
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  };

  const isLoading = apiLoading;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
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
