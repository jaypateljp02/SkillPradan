import { Link } from 'wouter';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Home, User, Repeat, MessageCircle, Video, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from "../../assets/logo.png";

export function Navbar() {
  const { user, logout } = useAuth();

  // Handle logout with fallback mechanism
  const handleLogout = async () => {
    try {
      // Try using regular logout function
      if (logout) {
        await logout();
      } else {
        throw new Error("Logout function not available");
      }
    } catch (error) {
      console.log("Normal logout failed, using fallback method");
      
      // Force clear any cached data
      window.localStorage.clear();
      window.sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Manually redirect
      window.location.href = "/auth";
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  Skill प्रदान
                </span>
              </div>
            </div>

            <nav className="hidden md:ml-10 md:flex md:space-x-8">
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
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
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-center"
                      aria-label="Log out"
                      title="Log out"
                    >
                      <LogOut className="h-5 w-5 text-red-600 hover:text-red-700" />
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