import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut,
  User,
  ArrowRightLeft,
  GraduationCap,
  Trophy,
  Award
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
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 fixed top-0 w-full">
        <div className="px-4">
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
                  <div className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
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
      
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-16 bottom-0 bg-white w-72 shadow-sm border-r border-gray-200 py-8 z-10">
        <nav className="flex flex-col space-y-4 px-6">
          <div>
            <div
              onClick={() => window.location.href = "/profile"} 
              className={`flex items-center p-2 rounded-md cursor-pointer ${location === "/profile" ? "text-primary" : "text-gray-700"}`}
            >
              <User className="h-5 w-5 mr-3" />
              <span className="text-base font-medium">Profile</span>
            </div>
          </div>
          
          <div>
            <div
              onClick={() => window.location.href = "/barter"} 
              className={`flex items-center p-2 rounded-md cursor-pointer ${location === "/barter" ? "text-primary" : "text-gray-700"}`}
            >
              <ArrowRightLeft className="h-5 w-5 mr-3" />
              <span className="text-base font-medium">Barter</span>
            </div>
          </div>
          
          <div>
            <div
              onClick={() => window.location.href = "/points"} 
              className={`flex items-center p-2 rounded-md cursor-pointer ${location === "/points" ? "text-primary" : "text-gray-700"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 10H4V8h16v8z" />
                <path d="M10 10h4v4h-4z" />
              </svg>
              <span className="text-base font-medium">Points</span>
            </div>
          </div>
          
          <div>
            <div
              onClick={() => window.location.href = "/learn"} 
              className={`flex items-center p-2 rounded-md cursor-pointer ${location === "/learn" ? "text-primary" : "text-gray-700"}`}
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              <span className="text-base font-medium">Learn</span>
            </div>
          </div>
          
          <div>
            <div
              onClick={() => window.location.href = "/achievements"} 
              className={`flex items-center p-2 rounded-md cursor-pointer ${location === "/achievements" ? "text-primary" : "text-gray-700"}`}
            >
              <Award className="h-5 w-5 mr-3" />
              <span className="text-base font-medium">Achievements</span>
            </div>
          </div>
          
          {/* Weekly Challenge Card */}
          <div className="mt-auto pt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">Weekly Challenge</h3>
              <p className="text-sm text-gray-600">Complete 3 skill exchanges this week</p>
              
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: '66%' }}></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>2/3 completed</span>
                  <span>+200 points</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <main className="flex-1 pt-16 ml-72">
        <div className="p-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}