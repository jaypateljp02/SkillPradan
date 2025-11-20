import { Link } from 'wouter';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Home, User, Repeat, MessageCircle, Video, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from "../../assets/logo.png";
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user, logout } = useAuth();

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

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
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
              <Link to="/feed">
                <Button variant="outline" className="border-white/40 text-primary-foreground hover:bg-white/10">
                  Feed
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
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
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
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
