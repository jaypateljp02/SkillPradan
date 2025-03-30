import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";

export function PointsHistory() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded mb-4 w-48"></div>
        <div className="h-64 bg-neutral-100 rounded"></div>
      </div>
    );
  }
  
  // Filter and sort activities by date (newest first)
  const pointActivities = activities
    .filter(activity => activity.pointsEarned !== 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Points History</h4>
      
      <div className="mt-4 bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {pointActivities.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            No points history available
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="w-1/2">Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.description}
                  </TableCell>
                  <TableCell>
                    {format(new Date(activity.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={activity.pointsEarned > 0 ? "text-green-600" : "text-red-600"}>
                      {activity.pointsEarned > 0 ? `+${activity.pointsEarned}` : activity.pointsEarned}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
