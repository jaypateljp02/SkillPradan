import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Users, Calendar, MessageCircle, Video, Plus, FileText, 
  Settings, FolderUp, Globe, Lock, Code, Hammer, Loader2,
  Building2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Group schema for form validation
const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  isPrivate: z.boolean().default(false),
});

export function CommunitySection() {
  const [activeTab, setActiveTab] = useState("study-groups");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create group form
  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });
  
  interface GroupItem {
    id: number;
    name: string;
    description: string;
    isPrivate: boolean;
    createdById: number;
    createdAt: string;
    memberCount: number;
    members?: number;
    isPublic?: boolean;
    deadline?: string;
  }
  
  // Fetch groups
  const { 
    data: groups = [] as GroupItem[], 
    isLoading: isLoadingGroups,
    error: groupsError 
  } = useQuery<GroupItem[]>({
    queryKey: ['/api/groups'],
    enabled: !!user,
  });
  
  // Fetch user's groups
  const { 
    data: userGroups = [] as GroupItem[], 
    isLoading: isLoadingUserGroups 
  } = useQuery<GroupItem[]>({
    queryKey: ['/api/groups/user'],
    enabled: !!user,
  });
  
  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createGroupSchema>) => {
      // Get auth token using the helper function from queryClient
      const token = getToken();
      
      if (!token) {
        throw new Error('You must be logged in to create a community');
      }
      
      return await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          createdById: user?.id,
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create community');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Community created successfully",
      });
      setOpenCreateDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      // Get auth token using the helper function from queryClient
      const token = getToken();
      
      if (!token) {
        throw new Error('You must be logged in to join a community');
      }
      
      return await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }).then(res => {
        if (!res.ok) throw new Error('Failed to join community');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Joined community successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user'] });
      
      // Refresh the groups data
      window.location.reload();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to join community. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof createGroupSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a community",
        variant: "destructive",
      });
      return;
    }
    
    createGroupMutation.mutate(data);
  };
  
  const handleGroupClick = (groupId: number) => {
    setSelectedGroup(groupId);
    setSelectedTeam(null);
  };

  const handleTeamClick = (teamId: number) => {
    setSelectedTeam(teamId);
    setSelectedGroup(null);
  };
  
  const handleJoinGroup = (groupId: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a community",
        variant: "destructive",
      });
      return;
    }
    
    joinGroupMutation.mutate(groupId);
  };

  const selectedGroupData = groups.find((group: GroupItem) => group.id === selectedGroup);
  const selectedTeamData = userGroups.find((team: GroupItem) => team.id === selectedTeam);
  
  return (
    <div>
      <Tabs defaultValue="study-groups" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="study-groups">Communities</TabsTrigger>
          <TabsTrigger value="team-projects">Team Projects</TabsTrigger>
        </TabsList>
        
        {/* Communities Tab */}
        <TabsContent value="study-groups" className="space-y-8">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-medium text-neutral-900">👥 Join Communities</h3>
                <p className="text-sm text-neutral-500 mt-1">Public/private communities for collaborative learning</p>
              </div>
              <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Community
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new community</DialogTitle>
                    <DialogDescription>
                      Set up a community for collaborative learning. Fill out the details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. Data Structures Study Circle" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Briefly describe the purpose and focus of this community"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isPrivate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Private Community</FormLabel>
                              <FormDescription>
                                Private communities require admin approval to join
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createGroupMutation.isPending}
                          className="w-full"
                        >
                          {createGroupMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Community
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoadingGroups ? (
                <div className="col-span-3 flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : groups.length === 0 ? (
                <div className="col-span-3 text-center py-8 border rounded-lg">
                  <p className="text-neutral-500">No communities available. Create one to get started!</p>
                </div>
              ) : (
                groups.map((group: any) => (
                  <div 
                    key={group.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedGroup === group.id ? 'border-primary ring-2 ring-primary ring-opacity-30' : 'border-neutral-200 hover:border-primary'
                    }`}
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <div className={`h-24 ${!group.isPrivate ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'} flex items-center justify-center text-white`}>
                      {!group.isPrivate ? 
                        <Globe className="h-10 w-10" /> : 
                        <Lock className="h-10 w-10" />
                      }
                    </div>
                    <div className="p-4">
                      <div className="flex items-center">
                        <h4 className="font-medium text-neutral-900">{group.name}</h4>
                        {!group.isPrivate ? (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Public</span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Private</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{group.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {group.memberCount || 0} members
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinGroup(group.id);
                          }}
                          disabled={joinGroupMutation.isPending}
                        >
                          {joinGroupMutation.isPending && (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          )}
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {selectedGroupData && (
            <div className="border border-neutral-200 rounded-lg">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h4 className="font-medium text-neutral-900">{selectedGroupData.name}</h4>
                    {!selectedGroupData.isPrivate ? (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Public</span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Private</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedGroupData.description}</p>
              </div>
              
              <div className="p-4">
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Community Chat
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <Video className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <FolderUp className="h-4 w-4 mr-2" />
                    Share Files
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">📂 Shared Files</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Data Structures Notes.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Algorithms Cheat Sheet.docx</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 1 week ago</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Upload New File
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Members ({selectedGroupData.memberCount || 0})</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <UserAvatar 
                        key={i} 
                        name={`Member ${i+1}`} 
                        size="sm" 
                      />
                    ))}
                    {(selectedGroupData.memberCount || 0) > 5 && (
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-medium">
                        +{(selectedGroupData.memberCount || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Team Projects Tab */}
        <TabsContent value="team-projects" className="space-y-8">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-medium text-neutral-900">🛠️ Form Teams</h3>
                <p className="text-sm text-neutral-500 mt-1">Work on hackathons and assignments together</p>
              </div>
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingUserGroups ? (
                <div className="col-span-2 flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userGroups.length === 0 ? (
                <div className="col-span-2 text-center py-8 border rounded-lg">
                  <p className="text-neutral-500">You haven't joined any teams yet. Create one to get started!</p>
                </div>
              ) : (
                userGroups.map((team: any) => (
                  <div 
                    key={team.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedTeam === team.id ? 'border-primary ring-2 ring-primary ring-opacity-30' : 'border-neutral-200 hover:border-primary'
                    }`}
                    onClick={() => handleTeamClick(team.id)}
                  >
                    <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      <Hammer className="h-10 w-10" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-neutral-900">{team.name}</h4>
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{team.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">{team.memberCount || 0} members</span>
                        <span className="text-xs font-medium text-primary">
                          {team.createdAt && `Created: ${new Date(team.createdAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {selectedTeamData && (
            <div className="border border-neutral-200 rounded-lg">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-neutral-900">{selectedTeamData.name}</h4>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedTeamData.description}</p>
                <div className="mt-2 flex items-center">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span className="ml-1 text-xs text-neutral-700">Deadline: {selectedTeamData.deadline}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h5 className="text-md font-medium text-neutral-900 mb-3">💬 Team Chat</h5>
                <div className="bg-neutral-50 rounded-md p-4 h-48 overflow-y-auto mb-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <UserAvatar name="Raj Kumar" size="sm" />
                      <div className="ml-2 bg-white p-2 rounded-md shadow-sm">
                        <div className="flex items-center">
                          <span className="text-xs font-medium">Raj Kumar</span>
                          <span className="ml-2 text-xs text-neutral-500">10:30 AM</span>
                        </div>
                        <p className="text-sm mt-1">I've completed the initial backend API endpoints. Take a look at the code I've shared.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <UserAvatar name="Priya Singh" size="sm" />
                      <div className="ml-2 bg-white p-2 rounded-md shadow-sm">
                        <div className="flex items-center">
                          <span className="text-xs font-medium">Priya Singh</span>
                          <span className="ml-2 text-xs text-neutral-500">10:45 AM</span>
                        </div>
                        <p className="text-sm mt-1">Great work! I'll start integrating the frontend components with these endpoints.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 py-2 px-3 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  />
                  <Button className="rounded-l-none">Send</Button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-3">Shared Code & Resources</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="h-5 w-5 text-emerald-600" />
                        <span className="ml-2 text-sm font-medium">API Endpoints Implementation</span>
                      </div>
                      <span className="text-xs text-neutral-500">Updated 3 hours ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span className="ml-2 text-sm font-medium">Project Architecture.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Share New Resource
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Team Members ({selectedTeamData.memberCount || 0})</h5>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(Math.min(selectedTeamData.memberCount || 0, 5))].map((_, i) => (
                      <UserAvatar 
                        key={i} 
                        name={`Teammate ${i+1}`} 
                        size="sm" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}