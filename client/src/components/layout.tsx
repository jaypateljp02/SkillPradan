import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  User, 
  MessageCircle, 
  PieChart, 
  Users, 
  Calendar, 
  Medal,
  BookOpen,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { UserAvatar } from "@/components/ui/user-avatar";
import logoImage from "../assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <Link href={href}>
    <div className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
      active 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-gray-600 hover:bg-gray-100"
    }`}>
      {icon}
      <span className="ml-2">{label}</span>
    </div>
  </Link>
);

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

  const navItems = [
    { icon: <Home className="h-4 w-4" />, label: "Home", href: "/" },
    { icon: <User className="h-4 w-4" />, label: "Profile", href: "/profile" },
    { icon: <BookOpen className="h-4 w-4" />, label: "Learn", href: "/barter" },
    { icon: <MessageCircle className="h-4 w-4" />, label: "Chat", href: "/chat" },
    { icon: <Calendar className="h-4 w-4" />, label: "Sessions", href: "/sessions" },
    { icon: <Users className="h-4 w-4" />, label: "Study Groups", href: "/study-groups" },
    { icon: <PieChart className="h-4 w-4" />, label: "Teams", href: "/groups" },
    { icon: <Medal className="h-4 w-4" />, label: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  Skill Pradan
                </span>
              </div>
              
              {/* Navigation Links */}
              <div className="ml-10 flex space-x-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ))}
              </div>
            </div>
            
            {/* User menu and points */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center">
                    <div className="text-amber-600 mr-1">
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
      
      {/* Main content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}