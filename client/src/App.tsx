
import React, { useEffect, FC, ComponentType } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SocketProvider } from "@/hooks/use-socket";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VideoSession from "@/pages/video-session";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import GroupsPage from "@/pages/groups-page";
import StudyGroupsPage from "@/pages/study-groups-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { Layout } from "@/components/layout";
import FeedPage from "@/pages/feed-page";
import MessagesPage from "@/pages/messages-page";

// New protected route specifically for admin access
const AdminRoute = ({ component: Component, ...rest }: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // useEffect for redirects to ensure they happen after render
  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive"
      });
      setLocation("/auth");
      return;
    }

    // If not an admin, show toast and redirect to home
    if (!user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [user, toast, setLocation]);

  // Show loading or null while checking credentials
  if (!user || !user.isAdmin) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
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
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <AdminRoute path="/admin-dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin" component={() => {
        // Redirect to admin-dashboard when /admin is accessed
        const [, setLocation] = useLocation();
        useEffect(() => {
          setLocation("/admin-dashboard");
        }, [setLocation]);
        return <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>;
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
        <SocketProvider>
          <Router />
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
