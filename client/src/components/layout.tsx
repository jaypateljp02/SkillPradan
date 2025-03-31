import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Home, UserCircle, MessagesSquare, Video, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer">Skill प्रदान</span>
            </Link>
            
            {user && (
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <div className="flex items-center px-3 py-2 rounded-md bg-primary/10">
                    <Home className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Home</span>
                  </div>
                </Link>
                
                <Link href="/profile">
                  <div className="flex items-center px-3 py-2 rounded-md">
                    <UserCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Profile</span>
                  </div>
                </Link>
                
                <Link href="/barter">
                  <div className="flex items-center px-3 py-2 rounded-md">
                    <span className="text-sm font-medium">Barter</span>
                  </div>
                </Link>
                
                <Link href="/chat">
                  <div className="flex items-center px-3 py-2 rounded-md">
                    <MessagesSquare className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Chat</span>
                  </div>
                </Link>
                
                <Link href="/sessions">
                  <div className="flex items-center px-3 py-2 rounded-md">
                    <Video className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                </Link>
                
                <Link href="/groups">
                  <div className="flex items-center px-3 py-2 rounded-md">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Study Groups</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Student One</span>
                </div>
              </Link>
              <div className="cursor-pointer" onClick={logout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}