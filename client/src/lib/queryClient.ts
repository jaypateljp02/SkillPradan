import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Token storage
const AUTH_TOKEN_KEY = "auth_token";

// Get token from localStorage
export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Set token in localStorage
export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// Remove token from localStorage
export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status} ${res.statusText} for ${res.url}`);
    console.error(`Response body: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data);
  
  try {
    // Get auth token from storage
    const token = getToken();
    
    // Prepare headers with auth token if available
    const headers: Record<string, string> = {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-cache"
    });
    
    console.log(`Received response from ${url}:`, {
      status: res.status,
      statusText: res.statusText
    });
    
    // Check if we need to redirect to login
    if (res.status === 401 && url !== "/api/login") {
      console.log("Received 401, user not authenticated");
      removeToken(); // Clear invalid token
      window.location.href = "/auth";
      throw new Error("User not authenticated");
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Making query request to ${queryKey[0]}`);
    
    try {
      // Get auth token from storage
      const token = getToken();
      
      // Prepare headers with auth token if available
      const headers: Record<string, string> = {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      
      const res = await fetch(queryKey[0] as string, {
        headers,
        cache: "no-cache"
      });
      
      console.log(`Received query response from ${queryKey[0]}:`, {
        status: res.status,
        statusText: res.statusText
      });

      // Redirect to login page if unauthorized and path is not already auth-related
      if (res.status === 401 && !String(queryKey[0]).includes('/api/login') && !String(queryKey[0]).includes('/api/register')) {
        if (unauthorizedBehavior === "returnNull") {
          console.log("Returning null due to 401 status");
          
          // Clear token if it's invalid
          if (token) {
            console.log("Removing invalid token");
            removeToken();
          }
          
          // Only redirect if we're fetching the user data
          if (String(queryKey[0]) === '/api/user') {
            console.log("Redirecting to auth page due to unauthenticated user");
            window.location.href = "/auth";
          }
          return null;
        }
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query request to ${queryKey[0]} failed:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetching on window focus to keep token state fresh
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      retry: 1, // Retry once if query fails
    },
    mutations: {
      retry: false,
    },
  },
});

// Initialize auth state from local storage when app loads
// This allows users to stay logged in across page refreshes
export function initializeAuthFromStorage(): void {
  const token = getToken();
  if (token) {
    console.log("Found existing auth token in local storage");
    // Check token validity immediately to clean up any invalid tokens
    fetch("/api/user", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(async res => {
      if (res.ok) {
        console.log("Token is valid, user is authenticated");
        const userData = await res.json();
        queryClient.setQueryData(["/api/user"], userData);
      } else {
        console.log("Token is invalid, clearing local storage");
        removeToken();
      }
    }).catch(() => {
      console.log("Error checking token, clearing local storage");
      removeToken();
    });
  } else {
    console.log("No auth token found in local storage");
  }
}
