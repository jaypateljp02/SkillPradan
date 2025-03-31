import { ReactNode } from "react";
import { Navbar } from "@/components/ui/navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}