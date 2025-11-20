import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ConnectionStatus } from "./connection-status";
import { Navbar } from "@/components/ui/navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Redirect from old /admin path to the new /admin-dashboard path
  useEffect(() => {
    if (location === "/admin" && user?.isAdmin) {
      // Redirect to the new admin dashboard
      window.location.href = "/admin-dashboard";
    }
  }, [location, user]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {/* Connection status - will only render when needed */}
      <ConnectionStatus />
    </div>
  );
}