import { Home, Users, BarChart2, MessageSquare, Calendar, UserPlus } from "lucide-react";

const routes = [
  { path: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { path: "/profile", label: "Profile", icon: <Users className="h-4 w-4" /> },
  { path: "/barter", label: "Barter", icon: <BarChart2 className="h-4 w-4" /> },
  { path: "/groups", label: "Groups", icon: <UserPlus className="h-4 w-4" /> },
  { path: "/chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
  { path: "/sessions", label: "Sessions", icon: <Calendar className="h-4 w-4" /> },
];

// ... rest of the code (assuming the routes array is used in a navigation component) ...

export default routes; //Example export, adjust as needed based on the original code