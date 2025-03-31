import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { UserCircle, BarChart3, GraduationCap, Award, UsersRound } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-56 bg-gray-50 border-r flex flex-col">
        <div className="space-y-1 p-4">
          <SidebarItem
            href="/profile"
            icon={<UserCircle className="h-5 w-5" />}
            label="Profile"
            active={location === "/profile"}
          />
          <SidebarItem
            href="/exchanges"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Barter"
            active={location === "/exchanges"}
          />
          <SidebarItem
            href="/points"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Points"
            active={location === "/points"}
          />
          <SidebarItem
            href="/learn"
            icon={<GraduationCap className="h-5 w-5" />}
            label="Learn"
            active={location === "/learn"}
          />
          <SidebarItem
            href="/achievements"
            icon={<Award className="h-5 w-5" />}
            label="Achievements"
            active={location === "/achievements"}
          />
          <SidebarItem
            href="/groups"
            icon={<UsersRound className="h-5 w-5" />}
            label="Study Group"
            active={location === "/groups"}
          />
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ href, icon, label, active }: SidebarItemProps) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors
        ${active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}