import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "../hooks/use-auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error: ${res.status} ${res.statusText} for ${res.url}`);
    console.error(`Response body: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get auth token if available
export function getAuthTokenForRequest(): string | null {
  return getAuthToken();
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data);
  
  try {
    // Get auth token
    const token = getAuthTokenForRequest();
    
    // Prepare headers with token if available
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
    
    // Handle unauthorized status without automatic redirect
    if (res.status === 401 && url !== "/api/login" && window.location.pathname !== '/auth') {
      console.log("Received 401, user not authenticated");
      // We won't automatically redirect since we want users to stay on the page until they choose to log out
      // This aligns with our requirements to keep users on the main screen until they explicitly log out
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
      // Get auth token
      const token = getAuthTokenForRequest();
      
      // Prepare headers with token if available
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

      // Handle unauthorized status without automatic redirect
      if (res.status === 401 && !String(queryKey[0]).includes('/api/login') && !String(queryKey[0]).includes('/api/register')) {
        if (unauthorizedBehavior === "returnNull") {
          console.log("Returning null due to 401 status");
          
          // No automatic redirects - user stays on the current page
          // Only log the event for API user endpoint
          if (String(queryKey[0]) === '/api/user') {
            console.log("User authentication required but no redirect - keeping user on current page");
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

// Initialize auth state when app loads
export function initializeAuthFromStorage(): void {
  // Don't try to initialize auth on the auth page to avoid infinite redirects
  if (window.location.pathname === '/auth') {
    console.log("On auth page - skipping auth initialization");
    return;
  }

  // Check for token auth
  const token = getAuthTokenForRequest();
  if (token) {
    console.log("Token found, user may be authenticated");
    // The auth state will be managed by the AuthProvider
    return;
  } else {
    console.log("No authentication token found");
  }
}
