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

  const safeFormatDate = (dateValue: any): string => {
    try {
      if (!dateValue) return "Recently";

      const date = new Date(dateValue);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", dateValue);
        return "Recently";
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error, dateValue);
      return "Recently";
    }
  };

  console.log("Activity Feed Data:", activities);

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
            <div key={activity.id} className="bg-neutral-50 p-4 rounded-md border border-neutral-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 font-medium">
                    {safeFormatDate(activity.createdAt)}
                  </p>
                </div>
                {(activity.pointsEarned && Number(activity.pointsEarned) > 0) && (
                  <div className="ml-auto flex-shrink-0 pl-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
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
