import { Link } from 'wouter';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Home, User, Repeat, MessageCircle, Video, Users } from 'lucide-react';
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
              
              <Link href="/barter">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Repeat className="h-5 w-5 mr-1" />
                  Barter
                </a>
              </Link>
              
              <Link href="/chat">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <MessageCircle className="h-5 w-5 mr-1" />
                  Chat
                </a>
              </Link>
              
              <Link href="/sessions">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Video className="h-5 w-5 mr-1" />
                  Sessions
                </a>
              </Link>
              
              <Link href="/study-groups">
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Users className="h-5 w-5 mr-1" />
                  Study Groups
                </a>
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={handleLogout}
              >
                <UserAvatar 
                  src={user?.avatar || undefined} 
                  name={user?.name || ''} 
                  size="sm"
                />
                <span className="ml-2 text-sm font-medium text-neutral-700">
                  {user?.name}
                </span>
                <LogOut className="ml-1 h-5 w-5 text-neutral-400" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button variant="ghost">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}