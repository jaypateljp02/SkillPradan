import { User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface MobileNavProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export function MobileNav({ setActiveTab, activeTab }: MobileNavProps) {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      label: 'Profile',
      icon: <User className="text-lg" />,
      target: 'profile-tab',
      isRoute: false
    },
    {
      label: 'Feed',
      icon: <Newspaper className="text-lg" />,
      target: '/feed',
      isRoute: true
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="text-lg" />,
      target: '/messages',
      isRoute: true
    },
    {
      label: 'Skill Exchange',
      icon: <Repeat className="text-lg" />,
      target: 'barter-tab',
      isRoute: false
    },
    {
      label: 'Points',
      icon: <CreditCard className="text-lg" />,
      target: 'points-tab',
      isRoute: false
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="text-lg" />,
      target: 'learn-tab',
      isRoute: false
    },
    {
      label: 'Badges',
      icon: <Trophy className="text-lg" />,
      target: 'achievements-tab',
      isRoute: false
    },
    {
      label: 'Community',
      icon: <Users className="text-lg" />,
      target: 'study-group-tab',
      isRoute: false
    }
  ];

  const handleNavigation = (target: string) => {
    if (location === '/') {
      setActiveTab(target);
    } else {
      setLocation(`/?tab=${target}`);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 border-t border-neutral-100">
      <div className="flex justify-start gap-2 overflow-x-auto py-2 px-4 no-scrollbar w-full">
        {navItems.map((item) => {
          const isActive = item.isRoute ? location === item.target : (location === '/' && activeTab === item.target);

          if (item.isRoute) {
            return (
              <Link key={item.label} href={item.target}>
                <button
                  className={`flex flex-col items-center p-3 min-w-[64px] ${isActive ? 'text-primary' : 'text-neutral-500 hover:text-primary'}`}
                >
                  {item.icon}
                  <span className="text-[10px] mt-1">{item.label}</span>
                </button>
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.target)}
              className={`flex flex-col items-center p-3 min-w-[64px] ${isActive
                ? 'text-primary'
                : 'text-neutral-500 hover:text-primary'
                }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
