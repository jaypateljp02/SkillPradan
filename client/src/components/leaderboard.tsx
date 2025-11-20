import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";

type LeaderboardEntry = { id: number; name: string; university: string; exchanges: number; points: number; avatar: string };

export function Leaderboard() {
  const { user } = useAuth();
  
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded mb-4 w-48"></div>
        <div className="h-64 bg-neutral-100 rounded"></div>
      </div>
    );
  }
  
  // Find current user in leaderboard
  const userRank = leaderboard.findIndex(entry => entry.id === user?.id);
  
  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Skills Exchange Leaderboard</h4>
      
      <div className="mt-4 bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Exchanges</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No leaderboard data available
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry, index) => (
                <TableRow 
                  key={entry.id}
                  className={
                    entry.id === user?.id ? "bg-neutral-100" : 
                    index === 0 ? "bg-amber-50" : 
                    index === 1 ? "bg-neutral-50" : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? "bg-yellow-400 text-white" :
                            index === 1 ? "bg-neutral-400 text-white" :
                            index === 2 ? "bg-neutral-300 text-white" :
                            entry.id === user?.id ? "bg-primary text-white" : ""
                          }
                        `}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <UserAvatar 
                          src={entry.avatar}
                          name={entry.name}
                          size="sm"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {entry.name} {entry.id === user?.id ? "(You)" : ""}
                        </p>
                        <p className="text-xs text-neutral-500">{entry.university || "-"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-900">{entry.exchanges}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-neutral-900">{entry.points.toLocaleString()}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
