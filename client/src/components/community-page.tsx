
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Users, Search, UserPlus } from "lucide-react";

export function CommunityPage() {
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups"],
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search groups..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{group.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{group.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{group.memberCount} members</span>
              <Button variant="outline" size="sm">Join Group</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
