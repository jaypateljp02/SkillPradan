
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Users, BarChart2, MessageSquare, Calendar, UserPlus } from "lucide-react";

const routes = [
  { path: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { path: "/profile", label: "Profile", icon: <Users className="h-4 w-4" /> },
  { path: "/barter", label: "Barter", icon: <BarChart2 className="h-4 w-4" /> },
  { path: "/groups", label: "Groups", icon: <Users className="h-4 w-4" /> },
  { path: "/chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
  { path: "/sessions", label: "Sessions", icon: <Calendar className="h-4 w-4" /> },
];

export function Navigation() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            "flex items-center gap-2"
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
