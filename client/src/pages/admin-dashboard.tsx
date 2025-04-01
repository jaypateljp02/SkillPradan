import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Users, 
  Lightbulb, 
  RefreshCcw, 
  Shield, 
  ShieldX, 
  BarChart, 
  Book, 
  UserCheck,
  Users2,
  Award,
  Medal,
  Zap,
  Search,
  BadgeCheck,
  Clipboard,
  Star,
  TrendingUp,
  UserMinus,
  UserPlus,
  BookOpen,
  Layers
} from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Fetch system statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch system stats");
      }
      return response.json();
    }
  });
  
  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    }
  });
  
  // Fetch all skills
  const { data: skills } = useQuery({
    queryKey: ["/api/admin/skills"],
    queryFn: async () => {
      const response = await fetch("/api/admin/skills");
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      return response.json();
    }
  });
  
  // Fetch all exchanges
  const { data: exchanges } = useQuery({
    queryKey: ["/api/admin/exchanges"],
    queryFn: async () => {
      const response = await fetch("/api/admin/exchanges");
      if (!response.ok) {
        throw new Error("Failed to fetch exchanges");
      }
      return response.json();
    }
  });

  // Mutation to make a user an admin
  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user admin status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User has been granted admin privileges",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to remove admin status
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/remove-admin`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user admin status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Admin privileges have been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users?.filter((user: any) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.university.toLowerCase().includes(term)
    );
  });

  // Function to get user skills for the student details modal
  const getUserSkills = (userId: number) => {
    return skills?.filter((skill: any) => skill.userId === userId) || [];
  };

  // Generate top skills data for dashboard
  const getTopSkills = () => {
    if (!skills) return [];
    
    const skillCount: Record<string, number> = {};
    
    skills.forEach((skill: any) => {
      if (skillCount[skill.name]) {
        skillCount[skill.name]++;
      } else {
        skillCount[skill.name] = 1;
      }
    });
    
    return Object.entries(skillCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };
  
  // Calculate university distribution
  const getUniversityDistribution = () => {
    if (!users) return [];
    
    const uniCount: Record<string, number> = {};
    
    users.forEach((user: any) => {
      if (uniCount[user.university]) {
        uniCount[user.university]++;
      } else {
        uniCount[user.university] = 1;
      }
    });
    
    return Object.entries(uniCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage the Skill Pradan platform</p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="student-progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Student Progress</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Exchanges</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Badges & Challenges</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.stats?.users || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.stats?.skills || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.stats?.exchanges || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.stats?.sessions || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Overview of platform activity and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Study Groups</span>
                    <span className="text-xl font-bold">{stats?.stats?.groups || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Platform Status</span>
                    <span className="text-xl font-bold text-green-600">Active</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Total Exchanges</span>
                    <span className="text-xl font-bold">{stats?.stats?.exchanges || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Active Users Today</span>
                    <span className="text-xl font-bold">
                      {users?.length > 0 ? Math.ceil(users.length * 0.75) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          
            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>
                  Most popular skills on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopSkills().map((skill: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Progress 
                          value={skill.count * 10} 
                          max={100} 
                          className="h-2 w-32 mr-2" 
                        />
                        <span className="text-sm text-gray-500">{skill.count} users</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* University Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>University Distribution</CardTitle>
              <CardDescription>
                Breakdown of users by university
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getUniversityDistribution().map((uni: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{uni.name}</p>
                      <p className="text-xs text-gray-500">{uni.count} users</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and admin privileges
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all registered users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-2">
                          <UserAvatar 
                            name={user.name || "User"}
                            src={user.avatar || undefined}
                            className="h-8 w-8"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.university}</TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center w-fit">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center w-fit">
                              <UserCheck className="h-3 w-3 mr-1" />
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setSelectedUser(user)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="md:max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Profile: {user.name}</DialogTitle>
                                  <DialogDescription>
                                    Complete profile information for {user.username}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                                  <div className="flex flex-col items-center space-y-3">
                                    <UserAvatar 
                                      name={user.name || "User"}
                                      src={user.avatar || undefined}
                                      className="h-24 w-24"
                                    />
                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                    <Badge className={user.isAdmin ? 
                                      "bg-red-100 text-red-800 hover:bg-red-200" : 
                                      "bg-green-100 text-green-800 hover:bg-green-200"}
                                    >
                                      {user.isAdmin ? "Admin" : "User"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="col-span-2">
                                    <h4 className="font-medium mb-2">Personal Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-500">Username</p>
                                        <p>{user.username}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p>{user.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">University</p>
                                        <p>{user.university}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Level</p>
                                        <p>{user.level}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Points</p>
                                        <p className="font-medium text-yellow-600">{user.points} Points</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Joined</p>
                                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <h4 className="font-medium mb-2">Skills</h4>
                                    {getUserSkills(user.id).length === 0 ? (
                                      <p className="text-sm text-gray-500">No skills added yet.</p>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {getUserSkills(user.id).map((skill: any) => (
                                          <Badge key={skill.id} variant="outline" className="flex items-center">
                                            {skill.isTeaching ? (
                                              <Zap className="h-3 w-3 mr-1 text-amber-500" />
                                            ) : (
                                              <Book className="h-3 w-3 mr-1 text-blue-500" />
                                            )}
                                            {skill.name}
                                            <span className="text-xs ml-1">
                                              ({skill.isTeaching ? "Teaching" : "Learning"})
                                            </span>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  {user.isAdmin ? (
                                    <Button 
                                      variant="destructive"
                                      onClick={() => {
                                        removeAdminMutation.mutate(user.id);
                                      }}
                                    >
                                      <ShieldX className="h-4 w-4 mr-2" />
                                      Remove Admin Status
                                    </Button>
                                  ) : (
                                    <Button 
                                      onClick={() => {
                                        makeAdminMutation.mutate(user.id);
                                      }}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Make Admin
                                    </Button>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            {user.isAdmin ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <ShieldX className="h-3 w-3 mr-1" />
                                    Remove Admin
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove admin privileges from {user.name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeAdminMutation.mutate(user.id)}
                                    >
                                      Confirm
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Make Admin
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Grant Admin Privileges</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to make {user.name} an admin? This will give them full access to the platform.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => makeAdminMutation.mutate(user.id)}
                                    >
                                      Confirm
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Student Progress Tab */}
        <TabsContent value="student-progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-amber-500" />
                  <CardTitle>Top Performers</CardTitle>
                </div>
                <CardDescription>
                  Students with highest points and exchanges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.sort((a: any, b: any) => b.points - a.points).slice(0, 5).map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 font-bold text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <UserAvatar 
                        name={user.name || "User"}
                        src={user.avatar || undefined}
                        className="h-8 w-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.university}</p>
                      </div>
                      <div className="text-amber-600 font-medium">
                        {user.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full text-sm">
                  View Full Leaderboard
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle>Growth Champions</CardTitle>
                </div>
                <CardDescription>
                  Students with fastest skill growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.sort((a: any, b: any) => b.level - a.level).slice(0, 5).map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 font-bold text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <UserAvatar 
                        name={user.name || "User"}
                        src={user.avatar || undefined}
                        className="h-8 w-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <div className="flex items-center">
                          <Progress value={user.level * 10} max={100} className="h-1.5 w-24 mr-2" />
                          <span className="text-xs text-gray-500">Level {user.level}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full text-sm">
                  View All Growth Metrics
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-blue-600" />
                  <CardTitle>Active Collaborators</CardTitle>
                </div>
                <CardDescription>
                  Students with most exchange completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.slice(0, 5).map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 font-bold text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <UserAvatar 
                        name={user.name || "User"}
                        src={user.avatar || undefined}
                        className="h-8 w-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 10) + 1} exchanges
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full text-sm">
                  View All Collaborators
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress Analysis</CardTitle>
              <CardDescription>
                Track how students are progressing in different skill areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top Teaching Skills</h4>
                  {skills?.filter((s: any) => s.isTeaching).slice(0, 5).map((skill: any, i: number) => (
                    <div key={i} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50">
                          <Zap className="h-3 w-3 mr-1 text-amber-500" />
                          {skill.name}
                        </Badge>
                      </div>
                      <div className="text-sm">{skill.proficiencyLevel}</div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Top Learning Skills</h4>
                  {skills?.filter((s: any) => !s.isTeaching).slice(0, 5).map((skill: any, i: number) => (
                    <div key={i} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          <Book className="h-3 w-3 mr-1 text-blue-500" />
                          {skill.name}
                        </Badge>
                      </div>
                      <div className="text-sm">{skill.proficiencyLevel}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium mb-3">Skills Verification Progress</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {['JavaScript', 'Python', 'Data Science', 'React', 'Statistics'].map((skill, i) => (
                    <Card key={i} className="bg-gray-50 border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{skill}</span>
                          <Badge variant={i % 2 === 0 ? "default" : "outline"}>
                            {i % 2 === 0 ? "Popular" : "Growing"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Verified Users</span>
                            <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                          </div>
                          <Progress value={40 + i * 10} max={100} className="h-1.5" />
                          <div className="flex items-center justify-between text-sm">
                            <span>Avg. Proficiency</span>
                            <span>{['Beginner', 'Intermediate', 'Advanced'][i % 3]}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Skills</CardTitle>
              <CardDescription>
                View and manage skills across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all registered skills</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Proficiency</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills?.map((skill: any) => {
                    // Find the user for this skill
                    const user = users?.find((u: any) => u.id === skill.userId);
                    
                    return (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>
                          {user ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar 
                                name={user.name || "User"}
                                src={user.avatar || undefined}
                                className="h-6 w-6"
                              />
                              <span>{user.name}</span>
                            </div>
                          ) : (
                            `User ${skill.userId}`
                          )}
                        </TableCell>
                        <TableCell>
                          {skill.isTeaching ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center w-fit">
                              <Zap className="h-3 w-3 mr-1" />
                              Teaching
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center w-fit">
                              <Book className="h-3 w-3 mr-1" />
                              Learning
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{skill.proficiencyLevel}</TableCell>
                        <TableCell>
                          {skill.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center w-fit">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center w-fit">
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(skill.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
              <CardDescription>
                Analysis of teaching vs learning skills across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4">Teaching vs Learning Distribution</h4>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative h-36 w-36 rounded-full overflow-hidden">
                      <div 
                        className="absolute bg-amber-500 h-full" 
                        style={{ 
                          width: '100%', 
                          clipPath: `polygon(0 0, ${skills?.filter((s: any) => s.isTeaching).length / (skills?.length || 1) * 100}% 0, 100% 100%, 0% 100%)` 
                        }}
                      ></div>
                      <div 
                        className="absolute bg-blue-500 h-full" 
                        style={{ 
                          width: '100%', 
                          clipPath: `polygon(${skills?.filter((s: any) => s.isTeaching).length / (skills?.length || 1) * 100}% 0, 100% 0, 100% 100%, 0% 100%)` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Teaching ({skills?.filter((s: any) => s.isTeaching).length || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Learning ({skills?.filter((s: any) => !s.isTeaching).length || 0})</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Proficiency Levels</h4>
                  <div className="space-y-4">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => {
                      const count = skills?.filter((s: any) => s.proficiencyLevel === level).length || 0;
                      const percentage = skills?.length ? (count / skills.length) * 100 : 0;
                      
                      return (
                        <div key={level} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm capitalize">{level}</span>
                            <span className="text-sm text-gray-500">{count} skills ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} max={100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Exchanges</CardTitle>
                  <CardDescription>
                    View and manage skill exchanges across the platform
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Export Exchange Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all skill exchanges</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Skills Exchanged</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchanges?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No exchanges found in the system.
                      </TableCell>
                    </TableRow>
                  ) : (
                    exchanges?.map((exchange: any) => {
                      // Find teacher and student users
                      const teacher = users?.find((u: any) => u.id === exchange.teacherId);
                      const student = users?.find((u: any) => u.id === exchange.studentId);
                      
                      // Find the skills being exchanged
                      const teacherSkill = skills?.find((s: any) => s.id === exchange.teacherSkillId);
                      const studentSkill = skills?.find((s: any) => s.id === exchange.studentSkillId);
                      
                      return (
                        <TableRow key={exchange.id} className="group">
                          <TableCell className="font-medium">{exchange.id}</TableCell>
                          <TableCell>
                            {teacher ? (
                              <div className="flex items-center gap-2">
                                <UserAvatar 
                                  name={teacher.name || "Teacher"}
                                  src={teacher.avatar || undefined}
                                  className="h-6 w-6"
                                />
                                <span>{teacher.name}</span>
                              </div>
                            ) : (
                              `User ${exchange.teacherId}`
                            )}
                          </TableCell>
                          <TableCell>
                            {student ? (
                              <div className="flex items-center gap-2">
                                <UserAvatar 
                                  name={student.name || "Student"}
                                  src={student.avatar || undefined}
                                  className="h-6 w-6"
                                />
                                <span>{student.name}</span>
                              </div>
                            ) : (
                              `User ${exchange.studentId}`
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="bg-amber-50 w-fit">
                                <Zap className="h-3 w-3 mr-1 text-amber-500" />
                                {teacherSkill?.name || `Skill ${exchange.teacherSkillId}`}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 w-fit">
                                <Book className="h-3 w-3 mr-1 text-blue-500" />
                                {studentSkill?.name || `Skill ${exchange.studentSkillId}`}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                exchange.status === "completed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : exchange.status === "active"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              }
                            >
                              {exchange.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(exchange.sessionsCompleted / exchange.totalSessions) * 100} 
                                max={100} 
                                className="h-2 w-16" 
                              />
                              <span className="text-sm">
                                {exchange.sessionsCompleted || 0}/{exchange.totalSessions || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(exchange.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Exchange Analytics</CardTitle>
              <CardDescription>
                Insights into skill exchange patterns and success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Exchange Status Breakdown</h4>
                  </div>
                  <div className="space-y-3">
                    {['pending', 'active', 'completed', 'cancelled'].map((status) => {
                      const count = exchanges?.filter((e: any) => e.status === status).length || 0;
                      const percentage = exchanges?.length ? (count / exchanges.length) * 100 : 0;
                      
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm capitalize flex items-center">
                              <div
                                className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                  status === 'completed' ? 'bg-green-500' :
                                  status === 'active' ? 'bg-blue-500' :
                                  status === 'pending' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                              ></div>
                              {status}
                            </span>
                            <span className="text-sm text-gray-500">{count}</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            max={100} 
                            className={`h-2 ${
                              status === 'completed' ? 'bg-green-100' :
                              status === 'active' ? 'bg-blue-100' :
                              status === 'pending' ? 'bg-yellow-100' :
                              'bg-red-100'
                            }`} 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-4">Completion Rate By University</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>University</TableHead>
                        <TableHead>Exchanges</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Avg. Sessions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getUniversityDistribution().slice(0, 5).map((uni: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{uni.name}</TableCell>
                          <TableCell>{Math.floor(Math.random() * 10) + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={60 + index * 5} max={100} className="h-2 w-16" />
                              <span>{60 + index * 5}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{(2 + Math.random()).toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Badges & Challenges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-amber-500" />
                  <CardTitle>Platform Badges</CardTitle>
                </div>
                <CardDescription>
                  Manage and monitor badge distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Skill Master", description: "Complete 10 exchanges", icon: <Star className="h-5 w-5 text-amber-500" />, count: 5 },
                    { name: "Team Leader", description: "Lead 3 study groups", icon: <Users2 className="h-5 w-5 text-blue-500" />, count: 7 },
                    { name: "Verified Expert", description: "5+ verified skills", icon: <BadgeCheck className="h-5 w-5 text-green-500" />, count: 3 },
                    { name: "Mentor Star", description: "5+ teaching sessions", icon: <Zap className="h-5 w-5 text-purple-500" />, count: 8 }
                  ].map((badge, i) => (
                    <Card key={i} className="border bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            {badge.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{badge.name}</h4>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between items-center">
                          <span>Awarded</span>
                          <Badge variant="outline">{badge.count} users</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="sm" variant="outline">
                  Manage Badges
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Active Challenges</CardTitle>
                </div>
                <CardDescription>
                  Monitor ongoing platform challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      name: "Weekly Exchange Challenge", 
                      description: "Complete 3 skill exchanges", 
                      target: 3,
                      current: 2,
                      participants: 12,
                      daysLeft: 3
                    },
                    { 
                      name: "Skill Verification Challenge", 
                      description: "Verify 2 new skills", 
                      target: 2,
                      current: 1,
                      participants: 8,
                      daysLeft: 5
                    },
                    { 
                      name: "Group Study Marathon", 
                      description: "Participate in 5 group sessions", 
                      target: 5,
                      current: 3,
                      participants: 15,
                      daysLeft: 2
                    }
                  ].map((challenge, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{challenge.name}</h4>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {challenge.daysLeft} days left
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.current}/{challenge.target}</span>
                        </div>
                        <Progress 
                          value={(challenge.current / challenge.target) * 100} 
                          max={100} 
                          className="h-2" 
                        />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Participants</span>
                          <span>{challenge.participants} users</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="sm" variant="outline">
                  Create Challenge
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard Management</CardTitle>
              <CardDescription>
                View and adjust platform leaderboard settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Exchanges</TableHead>
                    <TableHead>Badges</TableHead>
                    <TableHead>Challenges</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.sort((a: any, b: any) => b.points - a.points).slice(0, 8).map((user: any, index: number) => (
                    <TableRow key={user.id}>
                      <TableCell>#{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar 
                            name={user.name || "User"}
                            src={user.avatar || undefined}
                            className="h-6 w-6"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.university}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-amber-600">{user.points}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 8)}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 5)}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 3)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Star className="h-3 w-3 mr-1" />
                            Award
                          </Button>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;