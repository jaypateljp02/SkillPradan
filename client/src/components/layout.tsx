import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Very simple header with just logo, points, username and logout */}
      <header className="bg-white border-b border-neutral-200 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-semibold text-lg text-primary">
              Skill Pradan
            </Link>
            
            <Link href="/study-groups" className="text-sm font-medium text-neutral-700 hover:text-primary">
              Study Groups
            </Link>
            
            <Link href="/groups" className="text-sm font-medium text-neutral-700 hover:text-primary">
              Team Projects
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-neutral-700">
              <CreditCard className="w-4 h-4 mr-1 text-amber-500" />
              <span className="text-sm font-medium">{user?.points || 0} Points</span>
            </div>
            
            <span className="text-sm font-medium text-neutral-700">{user?.name}</span>
            
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-700">
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}