import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function ProfileHeader() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col sm:flex-row">
      <div className="flex-shrink-0">
        <UserAvatar 
          src={user.avatar} 
          name={user.name} 
          size="lg" 
        />
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-6">
        <h2 className="text-xl font-bold text-neutral-900">{user.name}</h2>
        <p className="text-sm text-neutral-500">{user.university || "No university specified"}</p>
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-neutral-500 font-medium">4.9 (23 reviews)</span>
          </div>
          <span className="mx-2 text-neutral-300">|</span>
          <div className="flex items-center">
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Level {user.level}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-auto flex-shrink-0">
        <Button>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
