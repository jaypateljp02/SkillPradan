import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, RefreshCw, Award, GraduationCap, Trophy, Shield } from "lucide-react";
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
    <div className="min-h-screen flex bg-neutral-100 font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Logo and Brand */}
        <div className="px-4 h-16 flex items-center border-b border-gray-200">
          <div className="flex-shrink-0 flex items-center">
            <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold text-gray-800">
              Skill Pradan
            </span>
          </div>
        </div>
        
        {/* Sidebar Navigation Links */}
        <nav className="mt-6">
          <Link href="/profile">
            <div className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <User className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Profile</span>
            </div>
          </Link>
          <Link href="/barter">
            <div className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <RefreshCw className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Barter</span>
            </div>
          </Link>
          <Link href="/points">
            <div className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Award className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Points</span>
            </div>
          </Link>
          <Link href="/learn">
            <div className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <GraduationCap className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Learn</span>
            </div>
          </Link>
          <Link href="/achievements">
            <div className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Trophy className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
          </Link>
          {user?.isAdmin && (
            <Link href="/admin-dashboard">
              <div className="flex items-center px-6 py-3 text-primary hover:bg-gray-100 cursor-pointer">
                <Shield className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium font-bold">Admin Dashboard</span>
              </div>
            </Link>
          )}
        </nav>
        
        {/* Weekly Challenge Card */}
        <div className="mx-4 mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800">Weekly Challenge</h3>
          <p className="mt-1 text-xs text-gray-600">Complete 3 skill exchanges this week</p>
          
          <div className="mt-3 h-2 bg-gray-200 rounded-full">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '66%' }}></div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-600">2/3 completed</span>
            <span className="text-xs font-medium text-yellow-600">+200 points</span>
          </div>
        </div>
      </div>
      
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* User info moved to sidebar top */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
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
                <button 
                  onClick={handleLogout}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
      </div>
    </div>
  );
}