import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Smile } from "lucide-react";

export function PointsOverview() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Calculate percentage to next level
  const pointsForCurrentLevel = (user.level - 1) * 500;
  const pointsToNextLevel = user.level * 500;
  const remainingPoints = pointsToNextLevel - user.points;
  const progressPercentage = ((user.points - pointsForCurrentLevel) / 500) * 100;

  return (
    <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-lg p-6 text-white">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-lg font-medium">Your Points Balance</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold">{user.points.toLocaleString()}</p>
            <p className="ml-2 text-sm opacity-80">points</p>
          </div>
          <p className="mt-1 text-sm opacity-80">
            Level {user.level} | {remainingPoints} points until Level {user.level + 1}
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
