
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VideoSession from "@/pages/video-session";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import GroupsPage from "@/pages/groups-page";
import StudyGroupsPage from "@/pages/study-groups-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { Layout } from "@/components/layout";

// New protected route specifically for admin access
const AdminRoute = ({ component: Component, ...rest }: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // If not authenticated, redirect to auth page
  if (!user) {
    // Redirect to auth page
    setTimeout(() => {
      window.location.href = "/auth";
    }, 100);
    return null;
  }

  // If not an admin, show toast and redirect to home
  if (!user.isAdmin) {
    // Show toast and redirect to home page
    setTimeout(() => {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
        variant: "destructive"
      });
      window.location.href = "/";
    }, 100);
    return null;
  }

  // User is authenticated and is an admin
  return <Route {...rest} component={Component} />;
};

function Router() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Don't show layout on auth page
  const showLayout = location !== "/auth" && user !== null;

  const routes = (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={HomePage} />
      <ProtectedRoute path="/barter" component={HomePage} />
      <ProtectedRoute path="/chat" component={HomePage} />
      <ProtectedRoute path="/sessions" component={HomePage} />
      <ProtectedRoute path="/session/:id" component={VideoSession} />
      <ProtectedRoute path="/study-groups" component={StudyGroupsPage} />
      <ProtectedRoute path="/groups/:groupId/chat" component={GroupsPage} />
      <ProtectedRoute path="/groups/:groupId" component={GroupsPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <AdminRoute path="/admin-dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin" component={() => {
        // Redirect to admin-dashboard when /admin is accessed
        window.location.href = "/admin-dashboard";
        return null;
      }} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );

  return showLayout ? <Layout>{routes}</Layout> : routes;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
