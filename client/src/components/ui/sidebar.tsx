
import { useLocation } from "wouter";
import { 
  User, 
  Repeat, 
  CreditCard, 
  GraduationCap,
  Trophy,
  Users 
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  target: string;
}

export function Sidebar({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [location] = useLocation();

  // Only render this component on the home page
  if (location !== '/') return null;

  const navItems: NavItem[] = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'profile-tab'
    },
    {
      label: 'Barter',
      icon: <Repeat className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'barter-tab'
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'points-tab'
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'learn-tab'
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'achievements-tab'
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'study-group-tab'
    }
  ];

  return (
    <div className="hidden md:block md:w-64 md:flex-shrink-0">
      <div className="sticky top-6 py-6 flex flex-col h-[calc(100vh-80px)]">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.target)}
              className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-500 hover:bg-white hover:text-primary transition-colors"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="px-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-neutral-700">Weekly Challenge</h3>
              <p className="mt-1 text-xs text-neutral-500">Complete 3 skill exchanges this week</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-500">2/3 completed</span>
                  <span className="text-primary font-medium">+200 points</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full">
                  <div className="h-full w-2/3 bg-primary rounded-full transition-all duration-300 ease-in-out"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
