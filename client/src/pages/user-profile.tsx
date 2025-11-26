import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Loader2, MapPin, GraduationCap, Trophy, UserPlus, UserCheck, UserX, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Skill {
    id: number;
    name: string;
    proficiencyLevel: string;
    isTeaching: boolean;
    isVerified: boolean;
}

interface UserProfile {
    id: number;
    username: string;
    name: string;
    email: string;
    university: string;
    avatar: string;
    points: number;
    level: number;
    skills: Skill[];
    friendStatus: 'none' | 'pending' | 'accepted' | 'rejected';
    requestId: number | null;
    isRequester: boolean;
}

export default function UserProfilePage() {
    const [, params] = useRoute("/users/:id");
    const userId = params?.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery<UserProfile>({
        queryKey: [`/api/users/${userId}`],
        enabled: !!userId,
    });

    const sendRequestMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", `/api/friends/request/${userId}`);
        },
        onSuccess: () => {
            toast({
                title: "Request sent",
                description: "Friend request sent successfully",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
        },
    });

    const respondMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: number, status: 'accepted' | 'rejected' }) => {
            await apiRequest("PUT", `/api/friends/request/${requestId}`, { status });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Friend request updated",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold">User not found</h1>
                <p className="text-muted-foreground">The user you are looking for does not exist.</p>
            </div>
        );
    }

    const teachingSkills = user.skills.filter(s => s.isTeaching);
    const learningSkills = user.skills.filter(s => !s.isTeaching);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    <p className="text-muted-foreground">@{user.username}</p>
                                </div>

                                <div className="flex gap-2">
                                    {user.friendStatus === 'none' && (
                                        <Button onClick={() => sendRequestMutation.mutate()} disabled={sendRequestMutation.isPending}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Friend
                                        </Button>
                                    )}

                                    {user.friendStatus === 'pending' && user.isRequester && (
                                        <Button variant="secondary" disabled>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Request Sent
                                        </Button>
                                    )}

                                    {user.friendStatus === 'pending' && !user.isRequester && (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => respondMutation.mutate({ requestId: user.requestId!, status: 'accepted' })}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => respondMutation.mutate({ requestId: user.requestId!, status: 'rejected' })}
                                            >
                                                <UserX className="mr-2 h-4 w-4" />
                                                Decline
                                            </Button>
                                        </div>
                                    )}

                                    {user.friendStatus === 'accepted' && (
                                        <div className="flex gap-2">
                                            <Button variant="secondary">
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Friends
                                            </Button>
                                            <Link href={`/messages?user=${user.id}`}>
                                                <Button variant="outline">
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Message
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4" />
                                    {user.university}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Trophy className="h-4 w-4" />
                                    Level {user.level} • {user.points} Points
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills & Content */}
            <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Teaching</CardTitle>
                                <CardDescription>Skills {user.name} can teach you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {teachingSkills.length > 0 ? (
                                        teachingSkills.map(skill => (
                                            <Badge key={skill.id} variant="default" className="text-sm py-1 px-3">
                                                {skill.name}
                                                {skill.isVerified && (
                                                    <span className="ml-1 text-xs bg-white/20 rounded-full px-1">✓</span>
                                                )}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No teaching skills listed</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Learning</CardTitle>
                                <CardDescription>Skills {user.name} wants to learn</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {learningSkills.length > 0 ? (
                                        learningSkills.map(skill => (
                                            <Badge key={skill.id} variant="secondary" className="text-sm py-1 px-3">
                                                {skill.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No learning skills listed</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="posts" className="mt-6">
                    <UserPosts userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserPosts({ userId }: { userId: number }) {
    const { data: posts, isLoading } = useQuery<any[]>({
        queryKey: [`/api/posts`, { userId }],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/posts?userId=${userId}`);
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No posts yet
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Card key={post.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{post.title}</CardTitle>
                                <CardDescription>
                                    {(() => {
                                        try {
                                            return new Date(post.createdAt).toLocaleDateString();
                                        } catch (e) {
                                            return "Unknown date";
                                        }
                                    })()}
                                </CardDescription>
                            </div>
                            <Badge variant={post.type === 'question' ? 'secondary' : 'default'}>
                                {post.type}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
