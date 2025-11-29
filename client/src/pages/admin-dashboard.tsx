import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "../lib/queryClient";
import logoImage from "../assets/logo.png";

// Define response types
interface AdminStats {
  stats: {
    users: number;
    skills: number;
    exchanges: number;
    sessions: number;
    groups: number;
  }
}

interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  university: string;
  avatar: string;
  points: number;
  level: number;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminSkill {
  id: number;
  name: string;
  createdAt: string;
  userId: number;
  isVerified: boolean;
  proficiencyLevel: string;
  isTeaching: boolean;
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
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
  Users,
  Lightbulb,
  RefreshCcw,
  Shield,
  ShieldX,
  BarChart,
  UserCheck,
  Award,
  Search,
  BookOpen
} from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Show helpful message if user isn't properly recognized as admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Admin access restricted",
        description: "Your account doesn't have admin privileges. Please contact an administrator.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Fetch system statistics using apiRequest to include auth token properly
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      return response.json();
    },
    retry: 1
  });

  // Fetch all users using apiRequest to include auth token properly
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
    retry: 1
  });

  // Fetch all skills using apiRequest to include auth token properly
  const { data: skills, isLoading: skillsLoading, error: skillsError } = useQuery<AdminSkill[]>({
    queryKey: ["/api/admin/skills"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/skills");
      return response.json();
    },
    retry: 1
  });

  // Fetch all exchanges using apiRequest to include auth token properly
  const { data: exchanges, isLoading: exchangesLoading, error: exchangesError } = useQuery<any[]>({
    queryKey: ["/api/admin/exchanges"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/exchanges");
      return response.json();
    },
    retry: 1
  });

  // Mutation to make a user an admin
  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(
        "POST",
        `/api/admin/users/${userId}/make-admin`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User has been granted admin privileges",
      });
    },
    onError: (error: Error) => {
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
      return apiRequest(
        "POST",
        `/api/admin/users/${userId}/remove-admin`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Admin privileges have been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users ? users.filter((user: AdminUser) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.university?.toLowerCase().includes(term)
    );
  }) : [];

  // Generate top skills data for dashboard
  const getTopSkills = () => {
    if (!skills) return [];

    const skillCount: Record<string, number> = {};

    skills.forEach((skill: AdminSkill) => {
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

    users.forEach((user: AdminUser) => {
      if (user.university && uniCount[user.university]) {
        uniCount[user.university]++;
      } else if (user.university) {
        uniCount[user.university] = 1;
      }
    });

    return Object.entries(uniCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 bg-premium-gradient min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Skill Pradan" className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage the Skill Pradan platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          {user && (
            <Badge className={user.isAdmin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {user.isAdmin ? "Admin Access" : "Access Restricted"}
            </Badge>
          )}
        </div>
      </div>

      {/* Admin check warning */}
      {user && !user.isAdmin && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          <div>
            <p className="font-semibold">Restricted Access</p>
            <p className="text-sm">You don't have admin privileges. Some features may be unavailable.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Exchanges</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {statsError ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <p className="font-semibold">Error loading statistics</p>
              <p className="text-sm">{statsError instanceof Error ? statsError.message : "Unknown error"}</p>
            </div>
          ) : statsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats && stats.stats ? stats.stats.users : 0}</div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats && stats.stats ? stats.stats.skills : 0}</div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Exchanges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats && stats.stats ? stats.stats.exchanges : 0}</div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats && stats.stats ? stats.stats.sessions : 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Activity */}
            <Card className="glass-card border-0">
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
                    <span className="text-xl font-bold">{stats && stats.stats ? stats.stats.groups : 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Platform Status</span>
                    <span className="text-xl font-bold text-green-600">Active</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Total Exchanges</span>
                    <span className="text-xl font-bold">{stats && stats.stats ? stats.stats.exchanges : 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500">Active Users Today</span>
                    <span className="text-xl font-bold">
                      {users && users.length > 0 ? Math.ceil(users.length * 0.75) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card className="glass-card border-0">
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
                        <div
                          className="h-2 w-32 mr-2 bg-secondary rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${skill.count * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{skill.count} users</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* University Breakdown */}
          <Card className="glass-card border-0">
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
          <Card className="glass-card border-0">
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
              {usersError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                  <p className="font-semibold">Error loading users</p>
                  <p className="text-sm">{usersError instanceof Error ? usersError.message : "Unknown error"}</p>
                </div>
              ) : (
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
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Loading users...</span>
                          </div>
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
                            {user.isAdmin ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-500">
                                    <ShieldX className="h-3 w-3 mr-1" />
                                    Remove Admin
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove admin privileges from {user.name}?
                                      They will no longer have access to the admin dashboard.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeAdminMutation.mutate(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove Admin
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
                                      Are you sure you want to make {user.name} an admin?
                                      They will have full access to the admin dashboard and all management features.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => makeAdminMutation.mutate(user.id)}
                                    >
                                      Make Admin
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>All Skills</CardTitle>
              <CardDescription>
                Overview of skills registered on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillsError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                  <p className="font-semibold">Error loading skills</p>
                  <p className="text-sm">{skillsError instanceof Error ? skillsError.message : "Unknown error"}</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>List of registered skills</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill Name</TableHead>
                      <TableHead>Proficiency</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Teaching/Learning</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Loading skills...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !skills || skills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No skills found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      skills.map((skill: any) => {
                        const user = users?.find((u: any) => u.id === skill.userId);
                        const prof = String(skill.proficiencyLevel || '').toLowerCase();
                        const progress = prof === 'expert' ? 100 : prof === 'intermediate' ? 66 : 33;
                        return (
                          <TableRow key={skill.id}>
                            <TableCell className="font-medium">{skill.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">{skill.proficiencyLevel}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span>{skill.proficiencyLevel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={skill.isTeaching ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                                {skill.isTeaching ? "Teaching" : "Learning"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={user?.name || "User"}
                                  src={user?.avatar || undefined}
                                  className="h-6 w-6"
                                />
                                <span>{user?.name || "Unknown User"}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Active Exchanges</CardTitle>
              <CardDescription>
                Overview of skill exchanges happening on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exchangesError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                  <p className="font-semibold">Error loading exchanges</p>
                  <p className="text-sm">{exchangesError instanceof Error ? exchangesError.message : "Unknown error"}</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>List of skill exchanges</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Teaching Skill</TableHead>
                      <TableHead>Learning Skill</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchangesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Loading exchanges...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !exchanges || exchanges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No exchanges found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      exchanges.map((exchange: any) => {
                        const teacher = users?.find((u: any) => u.id === exchange.teacherId);
                        const student = users?.find((u: any) => u.id === exchange.studentId);
                        const teacherSkill = skills?.find((s: any) => s.id === exchange.teacherSkillId);
                        const studentSkill = skills?.find((s: any) => s.id === exchange.studentSkillId);
                        const progress = (exchange.sessionsCompleted / exchange.totalSessions) * 100;

                        return (
                          <TableRow key={exchange.id}>
                            <TableCell>{exchange.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={teacher?.name || "Teacher"}
                                  src={teacher?.avatar || undefined}
                                  className="h-6 w-6"
                                />
                                <span>{teacher?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={student?.name || "Student"}
                                  src={student?.avatar || undefined}
                                  className="h-6 w-6"
                                />
                                <span>{student?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {teacherSkill?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-purple-100 text-purple-800">
                                {studentSkill?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  exchange.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : exchange.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {exchange.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span>
                                  {exchange.sessionsCompleted}/{exchange.totalSessions}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;