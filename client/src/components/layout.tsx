import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, LogOut, Home, Menu, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header with points and logout */}
      <header className="bg-white border-b border-neutral-200 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="font-semibold text-lg text-primary">
              Skill Pradan
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-6 space-x-4">
              <Link href="/" className={`px-2 py-1 text-sm font-medium rounded-md ${location === '/' ? 'text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <Home className="w-4 h-4 inline mr-1" />
                Home
              </Link>
              <Link href="/study-groups" className={`px-2 py-1 text-sm font-medium rounded-md ${location === '/study-groups' ? 'text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <Users className="w-4 h-4 inline mr-1" />
                Study Groups
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-neutral-700">
              <CreditCard className="w-4 h-4 mr-1 text-amber-500" />
              <span className="text-sm font-medium">{user?.points || 0} Points</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-700 hidden md:flex">
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-sm">Logout</span>
            </Button>
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="md:hidden">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 py-2 border-t border-neutral-200">
            <div className="container mx-auto">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className={`px-2 py-2 text-sm font-medium rounded-md ${location === '/' ? 'text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                  <Home className="w-4 h-4 inline mr-1" />
                  Home
                </Link>
                <Link href="/study-groups" className={`px-2 py-2 text-sm font-medium rounded-md ${location === '/study-groups' ? 'text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  Study Groups
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 py-2 text-sm font-medium text-neutral-500 hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}