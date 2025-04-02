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
  urlOrMethod: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown | undefined,
): Promise<Response> {
  let method: string;
  let url: string;
  let options: RequestInit | undefined;
  
  // Handle different calling styles:
  // apiRequest(url) - GET request to url
  // apiRequest(url, options) - request to url with options
  // apiRequest(method, url, data) - legacy style
  
  if (typeof urlOrOptions === 'string') {
    // Legacy style: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrOptions;
    options = {
      method,
      body: data ? JSON.stringify(data) : undefined,
    };
    console.log(`Making ${method} request to ${url}`, data);
  } else {
    // New style: apiRequest(url, options)
    url = urlOrMethod;
    options = urlOrOptions || {};
    method = options.method || 'GET';
    console.log(`Making ${method} request to ${url}`, options);
  }
  
  try {
    // Get auth token from storage
    const token = getToken();
    
    // Prepare headers with auth token if available
    const headersObj: Record<string, string> = {};
    
    // Add existing headers if any
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headersObj[key] = value;
        }
      });
    }
    
    // Add Content-Type if we have a body
    if (options?.body) {
      headersObj["Content-Type"] = "application/json";
    }
    
    // Add Authorization if we have a token
    if (token) {
      headersObj["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(url, {
      ...options,
      method,
      headers: headersObj,
      cache: "no-cache"
    });
    
    console.log(`Received response from ${url}:`, {
      status: res.status,
      statusText: res.statusText
    });
    
    // Check if we need to redirect to login
    if (res.status === 401 && url !== "/api/login" && window.location.pathname !== '/auth') {
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
          
          // Only redirect if we're fetching the user data and we're not already on the auth page
          if (String(queryKey[0]) === '/api/user' && window.location.pathname !== '/auth') {
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
  // SIMPLIFIED AUTH INITIALIZATION TO PREVENT WHITE SCREEN
  // We'll only set the token data if it exists, but won't redirect or clear it
  // This ensures routes work properly without aggressive redirects
  
  const token = getToken();
  if (token && window.location.pathname !== '/auth') {
    console.log("Found existing auth token in local storage");
    
    // Set a default user to prevent white screen while loading
    // This will be overwritten if the token is valid
    queryClient.setQueryData(["/api/user"], {
      id: "loading",
      username: "loading",
      name: "Loading User...",
      email: "loading@example.com",
      role: "user"
    });
    
    // Then check token validity in the background
    fetch("/api/user", {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-cache"
    }).then(async res => {
      if (res.ok) {
        console.log("Token is valid, user is authenticated");
        const userData = await res.json();
        queryClient.setQueryData(["/api/user"], userData);
      } else {
        console.log("Token is invalid but not clearing to prevent white screen");
        // We won't clear invalid tokens or force redirects anymore
        // Let the components handle auth state naturally
      }
    }).catch((error) => {
      console.log("Error checking token:", error);
      // Again, not clearing token or forcing redirects
    });
  } else {
    console.log("No auth token found in local storage or on auth page");
    // Not forcing any redirects, let components handle this naturally
  }
}
