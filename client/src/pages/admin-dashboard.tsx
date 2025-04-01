import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";
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
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
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
  Book, 
  UserCheck,
  Users2 
} from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
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
  const { data: users } = useQuery({
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage the Skill Pradan platform</p>
        </div>
      </div>
      
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
          
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>
                Overview of platform activity and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">Study Groups</span>
                  <span className="text-xl font-bold">{stats?.stats?.groups || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">Platform Usage</span>
                  <span className="text-xl font-bold">Active</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">Total Exchanges</span>
                  <span className="text-xl font-bold">{stats?.stats?.exchanges || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user accounts and admin privileges
              </CardDescription>
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
                  {users?.map((user: any) => (
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Proficiency</TableHead>
                    <TableHead>Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills?.map((skill: any) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>{skill.userId}</TableCell>
                      <TableCell>{skill.isTeaching ? "Teaching" : "Learning"}</TableCell>
                      <TableCell className="capitalize">{skill.proficiencyLevel}</TableCell>
                      <TableCell>
                        {skill.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Exchanges</CardTitle>
              <CardDescription>
                View and manage skill exchanges across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of all skill exchanges</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchanges?.map((exchange: any) => (
                    <TableRow key={exchange.id}>
                      <TableCell className="font-medium">{exchange.id}</TableCell>
                      <TableCell>{exchange.teacherId}</TableCell>
                      <TableCell>{exchange.studentId}</TableCell>
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
                        {exchange.sessionsCompleted || 0}/{exchange.totalSessions || 0}
                      </TableCell>
                      <TableCell>{new Date(exchange.createdAt).toLocaleDateString()}</TableCell>
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