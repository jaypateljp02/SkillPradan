import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Repeat as Exchange, MessageCircle, Video } from 'lucide-react';

interface NavItem {
  label: string;
  icon: JSX.Element;
}

export function Sidebar({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [location] = useLocation();

  // Only render this component on the home page
  if (location !== '/') return null;

  const navItems: NavItem[] = [
    {
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      label: 'Barter',
      icon: <Exchange className="h-4 w-4" />,
    },
    {
      label: 'Chat',
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      label: 'Sessions',
      icon: <Video className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-white border-r">
      <div className="flex-1">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab(item.label.toLowerCase())}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}