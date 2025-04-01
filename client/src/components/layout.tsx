import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
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
      {/* Header with logo and user info */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  Skill Pradan
                </span>
              </div>
            </div>
            
            {/* User menu and points */}
            <div className="flex items-center space-x-4">
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
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="ml-3 text-gray-400 hover:text-gray-600"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation bar below header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/barter">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Skill Exchange
              </span>
            </Link>
            <Link href="/sessions">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Sessions
              </span>
            </Link>
            <Link href="/study-groups">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Study Groups
              </span>
            </Link>
            <Link href="/groups">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Teams
              </span>
            </Link>
            <Link href="/chat">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Messages
              </span>
            </Link>
            <Link href="/profile">
              <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">
                Profile
              </span>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin-dashboard">
                <span className="px-3 py-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 cursor-pointer font-bold">
                  Admin Dashboard
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}