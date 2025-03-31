
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, FileText, Calendar, MessageSquare, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function StudyGroups() {
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPrivate: false
  });
  
  const queryClient = useQueryClient();
  
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/groups"]);
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/groups"]);
    }
  });

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    await createGroupMutation.mutate(newGroup);
    setNewGroup({ name: "", description: "", isPrivate: false });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Group</DialogTitle>
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
              <Button type="submit" className="w-full">
                Create Group
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{group.name}</h3>
              {group.isPrivate && (
                <span className="text-xs bg-neutral-100 px-2 py-1 rounded">Private</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{group.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/groups/${group.id}/files`}>
                  <FileText className="h-4 w-4 mr-1" />
                  Files
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/groups/${group.id}/events`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Events
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/groups/${group.id}/chat`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Link>
              </Button>
              <Button 
                size="sm"
                onClick={() => joinGroupMutation.mutate(group.id)}
              >
                Join Group
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
