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
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}