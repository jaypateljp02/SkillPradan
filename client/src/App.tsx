
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VideoSession from "@/pages/video-session";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import GroupsPage from "@/pages/groups-page";
import { Navigation } from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/session/:id" component={VideoSession} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="container mx-auto py-4">
              <Navigation />
            </div>
          </header>
          <Router />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
