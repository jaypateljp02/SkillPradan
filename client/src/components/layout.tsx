import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut,
  User,
  ArrowRightLeft,
  MessageCircle,
  GraduationCap,
  Trophy,
  Users
} from "lucide-react";
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
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm z-10 fixed top-0 w-full">
        <div className="max-w-7xl mx-auto px-4">
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
                  <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center">
                    <span className="text-amber-600 mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 10H4V8h16v8z" />
                        <path d="M10 10h4v4h-4z" />
                      </svg>
                    </span>
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
      
      {/* Main content */}
      <main className="flex-1 p-6 pt-20 pb-20 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-6 h-16">
            <Link href="/profile">
              <a className={`flex flex-col items-center justify-center ${location === "/profile" ? "text-primary" : "text-gray-500"}`}>
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Profile</span>
              </a>
            </Link>
            
            <Link href="/barter">
              <a className={`flex flex-col items-center justify-center ${location === "/barter" ? "text-primary" : "text-gray-500"}`}>
                <ArrowRightLeft className="h-5 w-5" />
                <span className="text-xs mt-1">Barter</span>
              </a>
            </Link>
            
            <Link href="/points">
              <a className={`flex flex-col items-center justify-center ${location === "/points" ? "text-primary" : "text-gray-500"}`}>
                <Trophy className="h-5 w-5" />
                <span className="text-xs mt-1">Points</span>
              </a>
            </Link>
            
            <Link href="/learn">
              <a className={`flex flex-col items-center justify-center ${location === "/learn" ? "text-primary" : "text-gray-500"}`}>
                <GraduationCap className="h-5 w-5" />
                <span className="text-xs mt-1">Learn</span>
              </a>
            </Link>
            
            <Link href="/study-groups">
              <a className={`flex flex-col items-center justify-center ${location === "/study-groups" ? "text-primary" : "text-gray-500"}`}>
                <Users className="h-5 w-5" />
                <span className="text-xs mt-1">Community</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}