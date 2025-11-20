import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Smile } from "lucide-react";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  university: string;
  avatar: string;
  points: number;
  level: number;
  createdAt: string;
}

export function PointsOverview() {
  const { user } = useAuth();
  
  // Fetch updated user data to ensure points are current
  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user"],
    refetchOnWindowFocus: true,
  });
  
  // Use the most up-to-date user data
  const currentUser = userData || user as User | null;
  
  if (!currentUser) return null;
  
  // Default values in case data is missing
  const level = currentUser.level || 1;
  const points = currentUser.points || 0;
  
  // Calculate percentage to next level
  const pointsForCurrentLevel = (level - 1) * 500;
  const pointsToNextLevel = level * 500;
  const remainingPoints = pointsToNextLevel - points;
  const progressPercentage = ((points - pointsForCurrentLevel) / 500) * 100;

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-medium">Your Points Balance</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold">{points.toLocaleString()}</p>
            <p className="ml-2 text-sm opacity-80">points</p>
          </div>
          <p className="mt-1 text-sm opacity-80">
            Level {level} | {remainingPoints} points until Level {level + 1}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Smile className="w-16 h-16 opacity-40" />
        </div>
      </div>
      <div className="mt-4">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-white bg-opacity-20">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white bg-opacity-40"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
