import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Loader2, MapPin, GraduationCap, Trophy, UserPlus, UserCheck, UserX, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

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
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20"></div>
                <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-md bg-white">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2 pt-12 md:pt-0 md:mt-14">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-neutral-900">{user.name}</h1>
                                    <p className="text-lg text-neutral-500 font-medium">@{user.username}</p>
                                </div>

                                <div className="flex gap-2">
                                    {user.friendStatus === 'none' && (
                                        <Button
                                            onClick={() => sendRequestMutation.mutate()}
                                            disabled={sendRequestMutation.isPending}
                                            className="bg-primary hover:bg-primary/90 shadow-sm"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Friend
                                        </Button>
                                    )}

                                    {user.friendStatus === 'pending' && user.isRequester && (
                                        <Button variant="secondary" disabled className="bg-neutral-100 text-neutral-500">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Request Sent
                                        </Button>
                                    )}

                                    {user.friendStatus === 'pending' && !user.isRequester && (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => respondMutation.mutate({ requestId: user.requestId!, status: 'accepted' })}
                                                className="bg-green-600 hover:bg-green-700 shadow-sm text-white"
                                            >
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => respondMutation.mutate({ requestId: user.requestId!, status: 'rejected' })}
                                                className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                            >
                                                <UserX className="mr-2 h-4 w-4" />
                                                Decline
                                            </Button>
                                        </div>
                                    )}

                                    {user.friendStatus === 'accepted' && (
                                        <div className="flex gap-2">
                                            <Button variant="secondary" className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Friends
                                            </Button>
                                            <Link href={`/messages?user=${user.id}`}>
                                                <Button variant="outline" className="bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm">
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Message
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-neutral-600 mt-4">
                                <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{user.university}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium">Level {user.level} • {user.points} Points</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills & Content */}
            <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-neutral-100/50 p-1 rounded-xl">
                    <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Skills</TabsTrigger>
                    <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Posts</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-neutral-100 bg-blue-50/50">
                                <h3 className="font-bold text-lg text-neutral-900">Teaching</h3>
                                <p className="text-sm text-neutral-500">Skills {user.name} can teach you</p>
                            </div>
                            <div className="p-6 flex-1">
                                <div className="flex flex-wrap gap-2">
                                    {teachingSkills.length > 0 ? (
                                        teachingSkills.map(skill => (
                                            <Badge key={skill.id} variant="default" className="text-sm py-1.5 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 shadow-none">
                                                {skill.name}
                                                {skill.isVerified && (
                                                    <span className="ml-1.5 text-[10px] bg-blue-600 text-white rounded-full w-4 h-4 inline-flex items-center justify-center">✓</span>
                                                )}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-500 italic">No teaching skills listed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-neutral-100 bg-purple-50/50">
                                <h3 className="font-bold text-lg text-neutral-900">Learning</h3>
                                <p className="text-sm text-neutral-500">Skills {user.name} wants to learn</p>
                            </div>
                            <div className="p-6 flex-1">
                                <div className="flex flex-wrap gap-2">
                                    {learningSkills.length > 0 ? (
                                        learningSkills.map(skill => (
                                            <Badge key={skill.id} variant="secondary" className="text-sm py-1.5 px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-none">
                                                {skill.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-500 italic">No learning skills listed</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="posts">
                    <UserPosts userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserPosts({ userId }: { userId: number }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: posts, isLoading } = useQuery<any[]>({
        queryKey: [`/api/posts`, { userId }],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/posts?userId=${userId}`);
            return res.json();
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: async (postId: number) => {
            const res = await apiRequest("DELETE", `/api/posts/${postId}`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to delete post");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Post deleted successfully",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/posts`, { userId }] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete post",
                variant: "destructive",
            });
        }
    });

    const handleDeletePost = (postId: number) => {
        if (confirm("Are you sure you want to delete this post?")) {
            deletePostMutation.mutate(postId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="bg-white/50 border border-dashed border-neutral-200 rounded-xl p-12 text-center">
                <p className="text-neutral-500 text-lg">No posts yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <div key={post.id} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={post.type === 'question' ? 'secondary' : 'default'} className={`
                                    ${post.type === 'question' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}
                                    border border-transparent shadow-none capitalize
                                `}>
                                    {post.type}
                                </Badge>
                                <span className="text-xs text-neutral-500">
                                    {(() => {
                                        try {
                                            return new Date(post.createdAt).toLocaleDateString();
                                        } catch (e) {
                                            return "Unknown date";
                                        }
                                    })()}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">{post.title}</h3>
                        </div>
                        {user && user.id === post.userId && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePost(post.id)}
                                disabled={deletePostMutation.isPending}
                                className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                title="Delete post"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
            ))}
        </div>
    );
}
