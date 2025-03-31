import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // This includes cookies in the request
      mode: "cors",
      cache: "no-cache",
    });
    
    console.log(`Received response from ${url}:`, {
      status: res.status,
      statusText: res.statusText,
      cookies: document.cookie ? "Present" : "None"
    });
    
    // Log what cookies we have
    console.log("Current cookies:", document.cookie || "None");
    
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
    console.log("Current cookies before request:", document.cookie || "None");
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include", // This includes cookies in the request
        cache: "no-cache",
        mode: "cors",
      });
      
      console.log(`Received query response from ${queryKey[0]}:`, {
        status: res.status,
        statusText: res.statusText,
        cookies: document.cookie ? "Present" : "None"
      });
      
      // Log what cookies we have after the response
      console.log("Current cookies after response:", document.cookie || "None");

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Returning null due to 401 status");
        return null;
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
      refetchOnWindowFocus: true, // Enable refetching on window focus to keep session state fresh
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      retry: 1, // Retry once if query fails
    },
    mutations: {
      retry: false,
    },
  },
});
