import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, Home, Users, MessageSquare, Calendar, BookOpen, Award, PanelLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import logoImage from "../assets/logo.png";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/barter", label: "Skill Exchange", icon: Award },
    { href: "/sessions", label: "Sessions", icon: Calendar },
    { href: "/study-groups", label: "Study Groups", icon: Users },
    { href: "/groups", label: "Teams", icon: Users },
    { href: "/chat", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: Users }, // Changed to Users icon instead of UserAvatar
  ];

  // Admin nav item - only visible for admins
  if (user?.isAdmin) {
    navItems.push({ 
      href: "/admin", 
      label: "Admin Dashboard", 
      icon: LayoutDashboard 
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm z-10">
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
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 flex-1">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                    >
                      <a 
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Collapse button */}
            <div className="p-4 border-t">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <div className="flex items-center w-full">
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    {!sidebarCollapsed && <span>Collapse</span>}
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>
      
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}