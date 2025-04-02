import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";
import { getToken } from "../lib/queryClient";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const hasToken = !!getToken();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user && !hasToken ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to continue</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => {
              window.location.href = "/auth";
            }}
          >
            Go to Login Page
          </button>
        </div>
      ) : (
        <Component />
      )}
    </Route>
  );
}
