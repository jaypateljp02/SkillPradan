import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Search, UserPlus, UserCheck, UserX, Loader2,
    User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
    id: number;
    username: string;
    name: string;
    avatar: string;
    university: string;
    level: number;
}

export default function FindFriendsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError, error } = useQuery<User[]>({
        queryKey: ["/api/users/search", searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.length < 2) return [];
            const response = await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            return response.json();
        },
        enabled: searchQuery.length >= 2,
    });

    // Also fetch current friends/requests to show correct status
    const { data: friends = [] } = useQuery<any[]>({
        queryKey: ["/api/friends"],
    });

    const { data: sentRequests = [] } = useQuery<any[]>({
        queryKey: ["/api/friends/requests/sent"],
    });

    const { data: receivedRequests = [] } = useQuery<any[]>({
        queryKey: ["/api/friends/requests/received"],
    });

    const getFriendStatus = (targetUserId: number) => {
        if (Array.isArray(friends) && friends.some((f: any) => f.user?.id === targetUserId)) return "friend";
        if (Array.isArray(receivedRequests) && receivedRequests.some((r: any) => r.userId === targetUserId)) return "received";
        if (Array.isArray(sentRequests) && sentRequests.some((r: any) => r.friendId === targetUserId)) return "sent";
        return "none";
    };

    const respondToRequestMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: number; status: 'accepted' | 'rejected' }) => {
            await apiRequest("PUT", `/api/friends/request/${requestId}`, { status });
        },
        onSuccess: (_, variables) => {
            toast({
                title: variables.status === 'accepted' ? "Request accepted" : "Request rejected",
                description: variables.status === 'accepted'
                    ? "You are now friends!"
                    : "Friend request rejected",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
            queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleBarterClick = () => {
        window.location.href = '/#barter-tab';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Find Friends</h1>
                <p className="text-muted-foreground">
                    Search for other students to connect, share skills, and learn together.
                </p>
            </div>
            {/* Friend Requests Section */}
            {
                receivedRequests && Array.isArray(receivedRequests) && receivedRequests.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Friend Requests ({receivedRequests.length})</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {receivedRequests.map((request: any) => (
                                <Card key={request.id} className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={request.user?.avatar} alt={request.user?.name} />
                                            <AvatarFallback>{request.user?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-lg">{request.user?.name}</CardTitle>
                                            <CardDescription>@{request.user?.username}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 gap-2"
                                                onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                                                disabled={respondToRequestMutation.isPending}
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 gap-2"
                                                onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                                disabled={respondToRequestMutation.isPending}
                                            >
                                                <UserX className="h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }

            <div className="relative mb-8">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or username..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {
                isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {users?.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                status={getFriendStatus(user.id)}
                                receivedRequests={receivedRequests}
                                onRespond={(requestId, status) => respondToRequestMutation.mutate({ requestId, status })}
                            />
                        ))}

                        {isError && (
                            <div className="col-span-full text-center py-12 text-destructive">
                                Failed to search users: {(error as Error)?.message || "Unknown error"}
                            </div>
                        )}

                        {searchQuery.length >= 2 && users?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No users found matching "{searchQuery}"
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                Type at least 2 characters to search
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}

function UserCard({ user, status, receivedRequests, onRespond }: { user: User, status: string, receivedRequests: any[], onRespond: (id: number, status: 'accepted' | 'rejected') => void }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const sendRequestMutation = useMutation({
        mutationFn: async (userId: number) => {
            await apiRequest("POST", `/api/friends/request/${userId}`);
        },
        onSuccess: () => {
            toast({
                title: "Request sent",
                description: "Friend request sent successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/friends/requests/sent"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <CardTitle className="text-lg">
                        <Link href={`/users/${user.id}`} className="hover:underline">
                            {user.name}
                        </Link>
                    </CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="text-sm text-muted-foreground">
                        <p>{user.university}</p>
                        <p>Level {user.level}</p>
                    </div>

                    {status === "friend" ? (
                        <Button variant="secondary" className="w-full gap-2" disabled>
                            <UserCheck className="h-4 w-4" />
                            Friends
                        </Button>
                    ) : status === "sent" ? (
                        <Button variant="secondary" className="w-full gap-2" disabled>
                            <Loader2 className="h-4 w-4" />
                            Request Sent
                        </Button>
                    ) : status === "received" ? (
                        <Button
                            className="w-full gap-2"
                            onClick={() => {
                                const request = receivedRequests?.find((r: any) => r.userId === user.id);
                                if (request) {
                                    onRespond(request.id, 'accepted');
                                }
                            }}
                        >
                            <UserCheck className="h-4 w-4" />
                            Accept Request
                        </Button>
                    ) : (
                        <Button
                            className="w-full gap-2"
                            onClick={() => sendRequestMutation.mutate(user.id)}
                            disabled={sendRequestMutation.isPending}
                        >
                            {sendRequestMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="h-4 w-4" />
                            )}
                            Add Friend
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
