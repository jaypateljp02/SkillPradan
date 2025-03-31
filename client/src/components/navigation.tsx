import { Link, useLocation } from "wouter";
import { 
  Home, 
  UserCircle, 
  MessagesSquare, 
  Video, 
  Users, 
  Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
      active: location === "/"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <UserCircle className="h-4 w-4" />,
      active: location === "/profile"
    },
    {
      name: "Barter",
      href: "/barter",
      icon: <Repeat className="h-4 w-4" />,
      active: location === "/barter"
    },
    {
      name: "Chat",
      href: "/chat",
      icon: <MessagesSquare className="h-4 w-4" />,
      active: location === "/chat"
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <Video className="h-4 w-4" />,
      active: location.startsWith("/session")
    },
    {
      name: "Study Groups",
      href: "/groups",
      icon: <Users className="h-4 w-4" />,
      active: location.startsWith("/groups")
    }
  ];

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted",
              item.active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground"
            )}
          >
            <span className="mr-2">{item.icon}</span>
            <span className="hidden md:inline">{item.name}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}