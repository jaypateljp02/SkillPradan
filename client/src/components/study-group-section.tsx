import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Users, Calendar, MessageCircle, Video, Plus, FileText, 
  Settings, FolderUp, Globe, Lock, Code, Hammer, Loader2,
  Building2, Trash2, Phone
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getAuthToken } from "@/hooks/use-auth";
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

export function StudyGroupSection() {
  const [activeTab, setActiveTab] = useState("study-groups");
  
  // Effect to refetch data when tab changes
  useEffect(() => {
    // Invalidate queries with the new activeTab value to force refetch
    queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
    queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
  }, [activeTab]);
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
    isTeamProject?: boolean;
  }
  
  // Fetch groups based on active tab
  const { 
    data: groups = [] as GroupItem[], 
    isLoading: isLoadingGroups,
    error: groupsError 
  } = useQuery<GroupItem[]>({
    queryKey: ['/api/groups', activeTab],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return [];
      }
      
      const isTeamProject = activeTab === 'team-projects';
      const response = await fetch(`/api/groups?isTeamProject=${isTeamProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      
      return await response.json();
    },
    enabled: !!user,
  });
  
  // Fetch user's groups based on active tab
  const { 
    data: userGroups = [] as GroupItem[], 
    isLoading: isLoadingUserGroups 
  } = useQuery<GroupItem[]>({
    queryKey: ['/api/groups/user', activeTab],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return [];
      }
      
      const isTeamProject = activeTab === 'team-projects';
      const response = await fetch(`/api/groups/user?isTeamProject=${isTeamProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user groups');
      }
      
      return await response.json();
    },
    enabled: !!user,
  });
  
  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createGroupSchema>) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('You must be logged in to create a study group');
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
          isTeamProject: activeTab === "team-projects" // Add flag for team projects
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create group');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: activeTab === "team-projects" ? "Team created successfully" : "Group created successfully",
      });
      setOpenCreateDialog(false);
      form.reset();
      // Invalidate all groups queries
      queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: activeTab === "team-projects" ? "Failed to create team. Please try again." : "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('You must be logged in to join a group');
      }
      
      // Check if user is already a member or creator of this group
      const isCreator = groups.some(group => group.id === groupId && group.createdById === user?.id);
      const isAlreadyMember = userGroups.some(group => group.id === groupId);
      
      if (isCreator) {
        throw new Error('You can\'t join a group you created');
      }
      
      if (isAlreadyMember) {
        throw new Error('You are already a member of this group');
      }
      
      return await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }).then(res => {
        if (!res.ok) throw new Error('Failed to join group');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Joined group successfully",
      });
      // Invalidate all groups queries
      queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to join group. Please try again.";
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
        description: "You must be logged in to create a group",
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
        description: "You must be logged in to join a group",
        variant: "destructive",
      });
      return;
    }
    
    joinGroupMutation.mutate(groupId);
  };
  
  // Placeholder function for showing features in development
  const handleFeatureInDevelopment = (featureName: string) => {
    toast({
      title: "Coming Soon",
      description: `The ${featureName} feature is currently in development.`,
      variant: "default",
    });
  };

  const selectedGroupData = groups.find((group: GroupItem) => group.id === selectedGroup);
  const selectedTeamData = userGroups.find((team: GroupItem) => team.id === selectedTeam);
  
  // Check if user is the creator of a group
  const isCreatorOfGroup = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    return group && group.createdById === user?.id;
  };
  
  // Check if user is already a member of a group
  const isAlreadyMember = (groupId: number) => {
    return userGroups.some(group => group.id === groupId);
  };
  
  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('You must be logged in to delete a group');
      }
      
      return await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete group');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: activeTab === "team-projects" ? "Team deleted successfully" : "Group deleted successfully",
      });
      // Reset selected group/team
      if (activeTab === "team-projects") {
        setSelectedTeam(null);
      } else {
        setSelectedGroup(null);
      }
      // Invalidate all groups queries
      queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete group. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  // Handle group deletion
  const handleDeleteGroup = (groupId: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a group",
        variant: "destructive",
      });
      return;
    }
    
    // Confirm deletion
    if (confirm(activeTab === "team-projects" 
      ? "Are you sure you want to delete this team? This action cannot be undone." 
      : "Are you sure you want to delete this group? This action cannot be undone."
    )) {
      deleteGroupMutation.mutate(groupId);
    }
  };
  
  return (
    <div>
      <Tabs defaultValue="study-groups" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="team-projects">Team Projects</TabsTrigger>
        </TabsList>
        
        {/* Study Groups Tab */}
        <TabsContent value="study-groups" className="space-y-8">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-medium text-neutral-900">👥 Join Study Groups</h3>
                <p className="text-sm text-neutral-500 mt-1">Public/private groups for collaborative learning</p>
              </div>
              <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new study group</DialogTitle>
                    <DialogDescription>
                      Set up a study group for collaborative learning. Fill out the details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Name</FormLabel>
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
                                placeholder="Briefly describe the purpose and focus of this study group"
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
                              <FormLabel>Private Group</FormLabel>
                              <FormDescription>
                                Private groups require admin approval to join
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
                          Create Group
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
                  <p className="text-neutral-500">No study groups available. Create one to get started!</p>
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
                        {isCreatorOfGroup(group.id) ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            disabled={deleteGroupMutation.isPending}
                          >
                            {deleteGroupMutation.isPending && (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        ) : isAlreadyMember(group.id) ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-primary"
                            disabled={true}
                          >
                            Joined
                          </Button>
                        ) : (
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
                        )}
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
                  {isCreatorOfGroup(selectedGroupData.id) && (
                    <Button variant="ghost" size="sm" onClick={() => handleFeatureInDevelopment('group management')}>
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedGroupData.description}</p>
              </div>
              
              <div className="p-4">
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('group chat')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Group Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('virtual session')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('file sharing')}
                  >
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
                        <span className="ml-2 text-sm font-medium">Study Notes.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Learning Materials.zip</span>
                      </div>
                      <span className="text-xs text-neutral-500">Shared 1 week ago</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-primary"
                      onClick={() => handleFeatureInDevelopment('file upload')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Upload New File
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Members ({selectedGroupData.memberCount || 0})</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(selectedGroupData.memberCount || 0, 5) }).map((_, i) => (
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
              <Button className="flex items-center" onClick={() => setOpenCreateDialog(true)}>
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
                    <div className="h-24 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                      <Hammer className="h-10 w-10" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center">
                        <h4 className="font-medium text-neutral-900">{team.name}</h4>
                        {!team.isPrivate ? (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">Public</span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Private</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{team.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {team.memberCount || 0} members
                        </span>
                        {team.deadline && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Due: {new Date(team.deadline).toLocaleDateString()}
                          </span>
                        )}
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
                  <div className="flex items-center">
                    <h4 className="font-medium text-neutral-900">{selectedTeamData.name}</h4>
                    {!selectedTeamData.isPrivate ? (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">Public</span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Private</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {isCreatorOfGroup(selectedTeamData.id) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleDeleteGroup(selectedTeamData.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Team
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFeatureInDevelopment('team management')}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{selectedTeamData.description}</p>
                {selectedTeamData.deadline && (
                  <div className="mt-2 p-2 bg-amber-50 rounded flex items-center">
                    <Calendar className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-800">
                      Deadline: {new Date(selectedTeamData.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('team chat')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Team Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('code collaboration')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Collaborate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleFeatureInDevelopment('team call')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Team Call
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">📂 Project Files</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-sm font-medium">Project Spec.pdf</span>
                      </div>
                      <span className="text-xs text-neutral-500">Updated 3 days ago</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-500" />
                        <span className="ml-2 text-sm font-medium">Prototype Designs.sketch</span>
                      </div>
                      <span className="text-xs text-neutral-500">Updated yesterday</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-purple-500" />
                        <span className="ml-2 text-sm font-medium">Database Schema.sql</span>
                      </div>
                      <span className="text-xs text-neutral-500">Updated 5 hours ago</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-primary"
                      onClick={() => handleFeatureInDevelopment('file upload')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Upload Project File
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Team Members ({selectedTeamData.memberCount || 0})</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(selectedTeamData.memberCount || 0, 5) }).map((_, i) => (
                      <UserAvatar 
                        key={i} 
                        name={`Team Member ${i+1}`} 
                        size="sm" 
                      />
                    ))}
                    {(selectedTeamData.memberCount || 0) > 5 && (
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-medium">
                        +{(selectedTeamData.memberCount || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-md font-medium text-neutral-900 mb-2">Project Progress</h5>
                  <div className="h-4 bg-neutral-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-blue-600"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-neutral-500">
                    <span>65% Complete</span>
                    <span>Updated 2 hours ago</span>
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