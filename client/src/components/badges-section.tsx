import { useQuery } from "@tanstack/react-query";
import { BadgeCard } from "@/components/ui/badge-card";
import { Plus } from "lucide-react";

export function BadgesSection() {
  const { data: userBadges = [], isLoading } = useQuery({
    queryKey: ["/api/user-badges"],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded mb-4 w-48"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Map colors to badges based on type or category
  const getBadgeColor = (badgeName: string) => {
    if (badgeName.includes("JavaScript")) return "primary";
    if (badgeName.includes("React")) return "secondary";
    if (badgeName.includes("Mentor")) return "accent";
    if (badgeName.includes("Code")) return "purple";
    if (badgeName.includes("Streak")) return "pink";
    return "primary";
  };
  
  // Map icons to badges based on name
  const getBadgeIcon = (badgeName: string) => {
    if (badgeName.includes("JavaScript")) return "js-square";
    if (badgeName.includes("React")) return "react";
    if (badgeName.includes("Mentor")) return "chalkboard-teacher";
    if (badgeName.includes("Code")) return "code-branch";
    if (badgeName.includes("Streak")) return "fire";
    return "certificate";
  };

  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Your Badges</h4>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {userBadges.length === 0 ? (
          <div className="col-span-full bg-neutral-50 p-4 rounded-md text-center">
            <p className="text-neutral-500">You haven't earned any badges yet</p>
          </div>
        ) : (
          <>
            {userBadges.map((userBadge: any) => (
              <BadgeCard
                key={userBadge.id}
                icon={getBadgeIcon(userBadge.badge.name)}
                name={userBadge.badge.name}
                description={userBadge.badge.description}
                color={getBadgeColor(userBadge.badge.name)}
              />
            ))}
            
            <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-4 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <Plus className="text-xl text-neutral-400" />
              </div>
              <p className="mt-2 text-sm text-neutral-500">Unlock more badges</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
