
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { PlusCircle, Users, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export function StudyGroups() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["/api/groups"],
  });

  const createGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          isPrivate: formData.get("isPrivate") === "true"
        })
      });
      
      if (!response.ok) throw new Error("Failed to create group");
      
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Study group created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading study groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <Input name="name" placeholder="Group Name" required />
              </div>
              <div>
                <Textarea name="description" placeholder="Group Description" />
              </div>
              <div>
                <label>
                  <input type="checkbox" name="isPrivate" value="true" />
                  Private Group
                </label>
              </div>
              <Button type="submit">Create Group</Button>
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
            </div>
            <p className="text-sm text-gray-600 mb-4">{group.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Files
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Events
              </Button>
              <Button size="sm">Join Group</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
