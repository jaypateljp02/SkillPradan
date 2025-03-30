import { User, Repeat, CreditCard, GraduationCap, Trophy } from 'lucide-react';

interface MobileNavProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export function MobileNav({ setActiveTab, activeTab }: MobileNavProps) {
  const navItems = [
    {
      label: 'Profile',
      icon: <User className="text-lg" />,
      target: 'profile-tab'
    },
    {
      label: 'Barter',
      icon: <Repeat className="text-lg" />,
      target: 'barter-tab'
    },
    {
      label: 'Points',
      icon: <CreditCard className="text-lg" />,
      target: 'points-tab'
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="text-lg" />,
      target: 'learn-tab'
    },
    {
      label: 'Badges',
      icon: <Trophy className="text-lg" />,
      target: 'achievements-tab'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.target)}
            className={`flex flex-col items-center p-3 ${
              activeTab === item.target 
                ? 'text-primary' 
                : 'text-neutral-500 hover:text-primary'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
