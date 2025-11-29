import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Users, Calendar, MessageCircle, Video, Plus, FileText,
  Settings, FolderUp, Globe, Lock, Code, Hammer, Loader2,
  Building2, Trash2, Phone, Trophy, Search
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
import { useLocation } from "wouter";

// Group schema for form validation
const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Group name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  isPrivate: z.boolean().default(false),
});

export function StudyGroupSection() {
  const [activeTab, setActiveTab] = useState("study-groups");
  const [, setLocation] = useLocation();

  // Effect to refetch data when tab changes
  useEffect(() => {
    // Invalidate queries with the new activeTab value to force refetch
    queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
    queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
  }, [activeTab]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    mutationFn: async (data: z.infer<typeof createGroupSchema> & { isTeamProject: boolean }) => {
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
          // isTeamProject is now passed in data
        }),
      }).then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || 'Failed to create group');
        }
        return res.json();
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success!",
        description: variables.isTeamProject ? "Team created successfully" : "Group created successfully",
      });
      setOpenCreateDialog(false);
      form.reset();
      // Invalidate all groups queries
      queryClient.invalidateQueries({ queryKey: ['/api/groups', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', activeTab] });
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Error",
        description: error.message || (variables.isTeamProject ? "Failed to create team. Please try again." : "Failed to create group. Please try again."),
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

    createGroupMutation.mutate({
      ...data,
      isTeamProject: activeTab === "team-projects"
    });
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
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
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
              <Button className="flex items-center" onClick={() => setOpenCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Group
              </Button>
            </div>

            <div className="mt-4 mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingGroups ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : groups.length === 0 ? (
                <div className="col-span-3 text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white/50">
                  <p className="text-neutral-500 text-lg">No study groups available. Create one to get started!</p>
                </div>
              ) : (
                groups
                  .filter(group =>
                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    group.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((group: any) => (
                    <div
                      key={group.id}
                      className={`group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${selectedGroup === group.id
                        ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]'
                        : 'hover:shadow-lg hover:-translate-y-1 border border-white/20 bg-white/80 backdrop-blur-sm'
                        }`}
                      onClick={() => handleGroupClick(group.id)}
                    >
                      <div className={`h-28 ${!group.isPrivate ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} flex items-center justify-center text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        {!group.isPrivate ?
                          <Globe className="h-12 w-12 drop-shadow-md transform group-hover:scale-110 transition-transform duration-500" /> :
                          <Lock className="h-12 w-12 drop-shadow-md transform group-hover:scale-110 transition-transform duration-500" />
                        }
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-neutral-900 truncate pr-2">{group.name}</h4>
                          {!group.isPrivate ? (
                            <span className="shrink-0 px-2.5 py-0.5 bg-blue-100/80 text-blue-700 text-xs font-medium rounded-full border border-blue-200">Public</span>
                          ) : (
                            <span className="shrink-0 px-2.5 py-0.5 bg-purple-100/80 text-purple-700 text-xs font-medium rounded-full border border-purple-200">Private</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4 h-10">{group.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.memberCount || 0} members
                          </span>
                          {isCreatorOfGroup(group.id) ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              disabled={deleteGroupMutation.isPending}
                            >
                              {deleteGroupMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          ) : isAlreadyMember(group.id) ? (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                              Joined
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 bg-primary/90 hover:bg-primary shadow-sm"
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
            <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-neutral-100/50 bg-gradient-to-r from-white/50 to-neutral-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-2xl font-bold text-neutral-900">{selectedGroupData.name}</h4>
                      {!selectedGroupData.isPrivate ? (
                        <span className="px-3 py-1 bg-blue-100/80 text-blue-700 text-xs font-bold rounded-full border border-blue-200 shadow-sm">Public</span>
                      ) : (
                        <span className="px-3 py-1 bg-purple-100/80 text-purple-700 text-xs font-bold rounded-full border border-purple-200 shadow-sm">Private</span>
                      )}
                    </div>
                    <p className="text-neutral-600 leading-relaxed max-w-2xl">{selectedGroupData.description}</p>
                  </div>
                  {isCreatorOfGroup(selectedGroupData.id) && (
                    <Button variant="outline" size="sm" onClick={() => handleFeatureInDevelopment('group management')} className="bg-white hover:bg-neutral-50 shadow-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Group
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm group"
                    onClick={() => setLocation(`/groups/${selectedGroupData.id}/chat`)}
                  >
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">Group Chat</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm group"
                    onClick={() => handleFeatureInDevelopment('virtual session')}
                  >
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                      <Video className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">Start Session</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all shadow-sm group"
                    onClick={() => handleFeatureInDevelopment('file sharing')}
                  >
                    <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                      <FolderUp className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">Share Files</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600"><FileText className="w-4 h-4" /></span>
                      Shared Files
                    </h5>
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-500 mr-3 group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Study Notes.pdf</span>
                            <span className="text-xs text-neutral-500">Shared 2 days ago</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FolderUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-yellow-50 text-yellow-500 mr-3 group-hover:bg-yellow-100 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Learning Materials.zip</span>
                            <span className="text-xs text-neutral-500">Shared 1 week ago</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FolderUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-neutral-300 text-neutral-500 hover:text-primary hover:border-primary hover:bg-primary/5"
                        onClick={() => handleFeatureInDevelopment('file upload')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload New File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600"><Users className="w-4 h-4" /></span>
                      Members ({selectedGroupData.memberCount || 0})
                    </h5>
                    <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                      <div className="flex flex-wrap gap-3">
                        {Array.from({ length: Math.min(selectedGroupData.memberCount || 0, 8) }).map((_, i) => (
                          <div key={i} className="relative group cursor-pointer">
                            <UserAvatar
                              name={`Member ${i + 1}`}
                              size="md"
                              className="border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                        ))}
                        {(selectedGroupData.memberCount || 0) > 8 && (
                          <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 font-bold border-2 border-white shadow-sm">
                            +{(selectedGroupData.memberCount || 0) - 8}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => handleFeatureInDevelopment('members list')}>
                          View All Members
                        </Button>
                      </div>
                    </div>
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

            <div className="mt-4 mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoadingUserGroups ? (
                <div className="col-span-2 flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : userGroups.length === 0 ? (
                <div className="col-span-2 text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white/50">
                  <p className="text-neutral-500 text-lg">You haven't joined any teams yet. Create one to get started!</p>
                </div>
              ) : (
                userGroups
                  .filter(team =>
                    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    team.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((team: any) => (
                    <div
                      key={team.id}
                      className={`group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${selectedTeam === team.id
                        ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]'
                        : 'hover:shadow-lg hover:-translate-y-1 border border-white/20 bg-white/80 backdrop-blur-sm'
                        }`}
                      onClick={() => handleTeamClick(team.id)}
                    >
                      <div className="h-28 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <Hammer className="h-12 w-12 drop-shadow-md transform group-hover:rotate-12 transition-transform duration-500" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-neutral-900 truncate pr-2">{team.name}</h4>
                          {!team.isPrivate ? (
                            <span className="shrink-0 px-2.5 py-0.5 bg-orange-100/80 text-orange-800 text-xs font-medium rounded-full border border-orange-200">Public</span>
                          ) : (
                            <span className="shrink-0 px-2.5 py-0.5 bg-red-100/80 text-red-800 text-xs font-medium rounded-full border border-red-200">Private</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4 h-10">{team.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {team.memberCount || 0} members
                          </span>
                          {team.deadline && (
                            <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(team.deadline).toLocaleDateString()}
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
            <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-neutral-100/50 bg-gradient-to-r from-white/50 to-neutral-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-2xl font-bold text-neutral-900">{selectedTeamData.name}</h4>
                      {!selectedTeamData.isPrivate ? (
                        <span className="px-3 py-1 bg-orange-100/80 text-orange-700 text-xs font-bold rounded-full border border-orange-200 shadow-sm">Public</span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100/80 text-red-700 text-xs font-bold rounded-full border border-red-200 shadow-sm">Private</span>
                      )}
                    </div>
                    <p className="text-neutral-600 leading-relaxed max-w-2xl">{selectedTeamData.description}</p>
                    {selectedTeamData.deadline && (
                      <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm font-medium">
                        <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                        Deadline: {new Date(selectedTeamData.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {isCreatorOfGroup(selectedTeamData.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => handleDeleteGroup(selectedTeamData.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Team
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeatureInDevelopment('team management')}
                      className="bg-white hover:bg-neutral-50 shadow-sm"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm group"
                    onClick={() => setLocation(`/groups/${selectedTeamData.id}/chat`)}
                  >
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm">Team Chat</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm group"
                    onClick={() => handleFeatureInDevelopment('code collaboration')}
                  >
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                      <Code className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm">Collaborate</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all shadow-sm group"
                    onClick={() => handleFeatureInDevelopment('team call')}
                  >
                    <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm">Team Call</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm group"
                    onClick={() => handleFeatureInDevelopment('file sharing')}
                  >
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                      <FolderUp className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm">Share Files</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600"><FileText className="w-4 h-4" /></span>
                      Project Files
                    </h5>
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-500 mr-3 group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Project Spec.pdf</span>
                            <span className="text-xs text-neutral-500">Updated 3 days ago</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FolderUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-green-50 text-green-500 mr-3 group-hover:bg-green-100 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Prototype Designs.sketch</span>
                            <span className="text-xs text-neutral-500">Updated yesterday</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FolderUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-purple-50 text-purple-500 mr-3 group-hover:bg-purple-100 transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Database Schema.sql</span>
                            <span className="text-xs text-neutral-500">Updated 5 hours ago</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FolderUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-neutral-300 text-neutral-500 hover:text-primary hover:border-primary hover:bg-primary/5"
                        onClick={() => handleFeatureInDevelopment('file upload')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Project File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-8">
                      <h5 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-green-100 text-green-600"><Users className="w-4 h-4" /></span>
                        Team Members ({selectedTeamData.memberCount || 0})
                      </h5>
                      <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
                        <div className="flex flex-wrap gap-3">
                          {Array.from({ length: Math.min(selectedTeamData.memberCount || 0, 8) }).map((_, i) => (
                            <div key={i} className="relative group cursor-pointer">
                              <UserAvatar
                                name={`Team Member ${i + 1}`}
                                size="md"
                                className="border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                          ))}
                          {(selectedTeamData.memberCount || 0) > 8 && (
                            <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 font-bold border-2 border-white shadow-sm">
                              +{(selectedTeamData.memberCount || 0) - 8}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600"><Trophy className="w-4 h-4" /></span>
                        Project Progress
                      </h5>
                      <div className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-2xl font-bold text-neutral-900">65%</span>
                          <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">On Track</span>
                        </div>
                        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                        <p className="mt-3 text-xs text-neutral-500 text-right">Last updated 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeTab === "team-projects" ? "Create a new team" : "Create a new study group"}</DialogTitle>
            <DialogDescription>
              {activeTab === "team-projects"
                ? "Set up a team for collaborative projects. Fill out the details below."
                : "Set up a study group for collaborative learning. Fill out the details below."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{activeTab === "team-projects" ? "Team Name" : "Group Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={activeTab === "team-projects" ? "E.g. Hackathon Team Alpha" : "E.g. Data Structures Study Circle"} {...field} />
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
                        placeholder={activeTab === "team-projects" ? "Describe your team's project and goals" : "Briefly describe the purpose and focus of this study group"}
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
                      <FormLabel>{activeTab === "team-projects" ? "Private Team" : "Private Group"}</FormLabel>
                      <FormDescription>
                        {activeTab === "team-projects" ? "Private teams require invite to join" : "Private groups require admin approval to join"}
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
                  {activeTab === "team-projects" ? "Create Team" : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}