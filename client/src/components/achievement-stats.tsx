import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Medal, Repeat, Trophy } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10">
        {icon}
      </div>
      <h4 className="mt-2 text-lg font-semibold text-neutral-900">{value}</h4>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

export function AchievementStats() {
  const { user } = useAuth();
  
  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/user-badges"],
  });
  
  const { data: exchanges = [] } = useQuery({
    queryKey: ["/api/exchanges"],
  });
  
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
  });
  
  // Count completed exchanges
  const completedExchanges = exchanges.filter(exchange => exchange.status === "completed").length;
  
  // Get user's position in leaderboard
  const userPosition = leaderboard.findIndex(entry => entry.id === user?.id) + 1;
  const leaderboardPosition = userPosition > 0 ? `#${userPosition}` : "N/A";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        icon={<Medal className="text-xl text-primary" />}
        value={userBadges.length}
        label="Badges Earned"
      />
      
      <StatCard
        icon={<Repeat className="text-xl text-emerald-500" />}
        value={completedExchanges}
        label="Skills Exchanged"
      />
      
      <StatCard
        icon={<Trophy className="text-xl text-amber-500" />}
        value={leaderboardPosition}
        label="Leaderboard Position"
      />
    </div>
  );
}
