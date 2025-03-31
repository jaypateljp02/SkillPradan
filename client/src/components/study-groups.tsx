
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, FileText, Calendar, MessageSquare, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function StudyGroups() {
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPrivate: false
  });
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  interface Group {
    id: number;
    name: string;
    description: string | null;
    isPrivate: boolean;
    createdById: number;
    createdAt: string;
    memberCount?: number;
  }

  const { data: myGroups = [], isLoading: myGroupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        return [];
      }
      const groups = await response.json();
      // Filter for team projects only
      return groups.filter((group: any) => group.isTeamProject === true);
    }
  });
  
  const { data: allGroups = [], isLoading: allGroupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups", "all"],
    queryFn: async () => {
      const response = await fetch("/api/groups?all=true");
      if (!response.ok) {
        return [];
      }
      const groups = await response.json();
      // Filter for team projects only
      return groups.filter((group: any) => group.isTeamProject === true);
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: typeof newGroup) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...groupData,
          isTeamProject: true // Mark this as a team project
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", "all"] });
      setCreateDialogOpen(false);
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", "all"] });
    }
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroupMutation.mutateAsync(newGroup);
      setNewGroup({ name: "", description: "", isPrivate: false });
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  
  // Check if a user is a member of a group already
  const isGroupMember = (groupId: number) => {
    return myGroups.some(group => group.id === groupId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Projects</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., IIT Coders"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What's this group about?"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={newGroup.isPrivate}
                  onCheckedChange={(checked) => setNewGroup({ ...newGroup, isPrivate: checked })}
                />
                <Label htmlFor="private">Private Group</Label>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-groups" className="mb-6">
        <TabsList>
          <TabsTrigger value="my-groups">My Teams</TabsTrigger>
          <TabsTrigger value="discover">Discover Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="my-groups">
          {myGroupsLoading ? (
            <p>Loading your teams...</p>
          ) : myGroups.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">You haven't joined any team projects yet</h3>
              <p className="text-muted-foreground mb-4">Join an existing team or create a new one to get started</p>
              <Button onClick={() => {
                const button = document.querySelector('button[value="discover"]') as HTMLButtonElement;
                if (button) button.click();
              }}>
                Discover Teams
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="discover">
          {allGroupsLoading ? (
            <p>Loading teams...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allGroups.filter(group => !group.isPrivate || isGroupMember(group.id)).map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={isGroupMember(group.id)}
                  onJoin={() => joinGroupMutation.mutate(group.id)}
                  isJoining={joinGroupMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface GroupCardProps {
  group: {
    id: number;
    name: string;
    description: string | null;
    isPrivate: boolean;
    memberCount?: number;
  };
  isMember: boolean;
  onJoin?: () => void;
  isJoining?: boolean;
}

function GroupCard({ group, isMember, onJoin, isJoining = false }: GroupCardProps) {
  return (
    <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{group.name}</h3>
        {group.isPrivate && (
          <Badge variant="outline" className="ml-auto">Private</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
      <div className="text-sm text-muted-foreground mb-3">
        <span className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {group.memberCount || 0} members
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {isMember ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${group.id}`}>
                Visit Group
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${group.id}/chat`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Link>
            </Button>
          </>
        ) : (
          <Button 
            size="sm"
            onClick={onJoin}
            disabled={isJoining}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {isJoining ? "Joining..." : "Join Team"}
          </Button>
        )}
      </div>
    </div>
  );
}
