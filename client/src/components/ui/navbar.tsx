import { Link, useLocation } from 'wouter';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Home, User, Repeat, Video, Users, Trophy, Bell, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoImage from "../../assets/logo.png";
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useQuery } from '@tanstack/react-query';

export function Navbar() {
  const { user, logout } = useAuth();

  // Fetch conversations for unread count
  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Fetch pending friend requests
  const { data: receivedRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/friends/requests/received"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Calculate total unread messages
  const unreadCount = conversations.reduce((total: number, conv: any) => total + (conv.unreadCount || 0), 0);

  // Simple direct logout function that always works
  const handleLogout = () => {
    // Display processing indicator
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
      logoutBtn.innerHTML = `<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>`;
    }

    console.log("Starting direct logout...");

    // Force clear any user data in memory
    if (auth && auth.currentUser) {
      signOut(auth).catch((e: Error) => console.error("Firebase signOut error:", e));
    }

    // Force clear all localStorage and sessionStorage
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
      console.log("Cleared local and session storage");
    } catch (e: unknown) {
      console.error("Error clearing storage:", e);
    }

    // Clear all cookies
    try {
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      console.log("Cleared cookies");
    } catch (e: unknown) {
      console.error("Error clearing cookies:", e);
    }

    // Redirect to auth page with forced reload
    setTimeout(() => {
      console.log("Redirecting to auth page...");
      window.location.href = "/auth";
    }, 500);
  };

  const [location] = useLocation();
  const isActive = location === '/messages' && window.location.search.includes('mode=find-friends');

  return (
    <header className="bg-primary/90 backdrop-blur-md shadow-lg border-b border-white/10 sticky top-0 z-50 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">
                  Skill प्रदान
                </span>
              </div>
            </div>

            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {user?.isAdmin && (
                <Link to="/admin-dashboard">
                  <Button variant="outline" className="border-white/40 text-primary-foreground hover:bg-white/10 bg-yellow-500/20 hover:bg-yellow-500/30" data-testid="button-admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/messages?mode=find-friends"
                      className={`relative p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105 flex items-center justify-center text-white shadow-sm ${isActive ? 'bg-white/30 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/20'
                        }`}
                      data-testid="button-notifications-bell"
                      aria-label="Notifications"
                      title="Notifications - View Friend Requests"
                    >
                      <Bell className="h-5 w-5" />
                      {receivedRequests.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                        >
                          {receivedRequests.length > 9 ? '9+' : receivedRequests.length}
                        </Badge>
                      )}
                    </Link>

                    <span className="bg-white/10 backdrop-blur-sm border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                      📜 {user?.points || 0} Points
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={user?.name || 'User'}
                      avatarUrl={user?.avatar}
                    />
                    <span className="text-sm font-medium">{user?.name}</span>
                    <button
                      id="logout-button"
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-sm"
                      aria-label="Log out"
                      title="Log out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
