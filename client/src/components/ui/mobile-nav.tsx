import { User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

interface MobileNavProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export function MobileNav({ setActiveTab, activeTab }: MobileNavProps) {
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
      label: 'Barter',
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

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = item.isRoute ? false : activeTab === item.target;
          return item.isRoute ? (
            <Link key={item.label} to={item.target}>
              <button
                className="flex flex-col items-center p-3 text-neutral-500 hover:text-primary"
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.target)}
              className={`flex flex-col items-center p-3 ${
                isActive
                  ? 'text-primary' 
                  : 'text-neutral-500 hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
