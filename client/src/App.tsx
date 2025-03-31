
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VideoSession from "@/pages/video-session";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import GroupsPage from "@/pages/groups-page";
import StudyGroupsPage from "@/pages/study-groups-page";
import { Layout } from "@/components/layout";

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
