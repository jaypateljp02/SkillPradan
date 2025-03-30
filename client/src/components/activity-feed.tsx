import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Repeat as ExchangeIcon, 
  Award, 
  UserCheck,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          <div className="h-24 bg-neutral-100 animate-pulse rounded-md"></div>
          <div className="h-24 bg-neutral-100 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exchange':
        return <ExchangeIcon className="text-primary" />;
      case 'badge':
        return <Award className="text-amber-500" />;
      case 'verification':
        return <UserCheck className="text-emerald-500" />;
      default:
        return <Calendar className="text-neutral-500" />;
    }
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
      
      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <div className="bg-neutral-50 p-4 rounded-md text-center">
            <p className="text-sm text-neutral-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="bg-neutral-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {activity.pointsEarned > 0 && (
                  <div className="ml-auto flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{activity.pointsEarned} points
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
