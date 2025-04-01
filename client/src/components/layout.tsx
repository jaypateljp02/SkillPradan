import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { UserAvatar } from "@/components/ui/user-avatar";
import logoImage from "../assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Redirect from old /admin path to the new /admin-dashboard path
  useEffect(() => {
    if (location === "/admin" && user?.isAdmin) {
      // Redirect to the new admin dashboard
      window.location.href = "/admin-dashboard";
    }
  }, [location, user]);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      {/* Header only with logo and user info */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                Skill Pradan
              </span>
            </div>
            
            {/* Admin dashboard link */}
            {user?.isAdmin && (
              <Link href="/admin-dashboard">
                <div className="ml-6 px-3 py-1 bg-primary/10 rounded-md text-primary hover:bg-primary/20 cursor-pointer flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </div>
              </Link>
            )}
          </div>
          
          {/* User info */}
          <div className="flex items-center space-x-2">
            {user && (
              <>
                <div className="bg-neutral-100 px-3 py-1 rounded-full flex items-center">
                  <div className="text-yellow-600 mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 10H4V8h16v8z" />
                      <path d="M10 10h4v4h-4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{user.points || 0} Points</span>
                </div>
                
                <div className="flex items-center">
                  <UserAvatar 
                    name={user.name || "User"}
                    src={user.avatar === null ? undefined : user.avatar}
                    className="h-8 w-8"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
                    {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
      </div>
    </div>
  );
}