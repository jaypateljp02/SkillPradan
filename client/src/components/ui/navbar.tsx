import { Link } from 'wouter';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Home, User, Repeat, MessageCircle, Video, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from "../../assets/logo.png";

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
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
              <Link href="/">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                  <Home className="h-5 w-5 mr-1" />
                  Home
                </a>
              </Link>
              <Link href="/profile">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <User className="h-5 w-5 mr-1" />
                  Profile
                </a>
              </Link>
              <Link href="/sessions">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Video className="h-5 w-5 mr-1" />
                  Sessions
                </a>
              </Link>
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
                    <UserAvatar user={user} />
                    <span className="text-sm font-medium">{user?.name}</span>
                    <button onClick={handleLogout}>
                      <LogOut className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
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