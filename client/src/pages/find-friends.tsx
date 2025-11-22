import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, UserPlus, UserCheck, UserX, Loader2 } from "lucide-react";
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
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Failed to search users");
            return res.json();
        },
        enabled: searchQuery.length >= 2,
    });

    // Also fetch current friends/requests to show correct status
    const { data: friends } = useQuery({
        queryKey: ["/api/friends"],
    });

    const { data: requests } = useQuery({
        queryKey: ["/api/friends/requests"],
    });

    const sendRequestMutation = useMutation({
        mutationFn: async (userId: number) => {
            await apiRequest("POST", `/api/friends/request/${userId}`);
        },
        onSuccess: () => {
            toast({
                title: "Request sent",
                description: "Friend request sent successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Find Friends</h1>
                <p className="text-muted-foreground">
                    Search for other students to connect, share skills, and learn together.
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or username..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {users?.map((user) => (
                        <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                                </div>
                            </CardContent>
                        </Card>
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
            )}
        </div>
    );
}
