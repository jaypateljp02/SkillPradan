
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Users, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: number;
  content: string;
  sentAt: string;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
    username: string;
  };
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: number;
  members: {
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      avatar: string | null;
      username: string;
      university: string | null;
    };
  }[];
}

import { apiRequest } from "@/lib/queryClient";

export function GroupChat() {
  const { groupId } = useParams();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${groupId}`);
      return response.json();
    }
  });

  // Fetch group messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: [`/api/groups/${groupId}/messages`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/groups/${groupId}/messages`);
      return response.json();
    },
    refetchInterval: 5000 // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/groups/${groupId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/messages`] });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format date to display in a readable format
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    // If message is from today, only show time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show date and time
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sender's initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Group header */}
      <header className="border-b border-white/20 p-3 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/?tab=study-group-tab">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          {groupLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div>
              <h2 className="font-semibold">{group?.name}</h2>
              <p className="text-xs text-muted-foreground">{group?.members.length} members</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}/files`}>
              <FileText className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}/events`}>
              <Calendar className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}/members`}>
              <Users className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = false; // We don't have current user ID here easily without useAuth, assuming left align for now or check if I can get user
                // Actually I should get user from useAuth to align messages correctly
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <Avatar className="border border-white/20 shadow-sm">
                      <AvatarImage src={msg.sender.avatar || undefined} alt={msg.sender.name} />
                      <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">{msg.sender.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(msg.sentAt)}
                        </span>
                      </div>
                      <div className="mt-1 bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-white/60 backdrop-blur-md">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessageMutation.isPending}
                className="bg-white/50 border-white/30 focus:bg-white/80 transition-all shadow-inner"
              />
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !message.trim()}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md transition-all hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="info" className="flex-1 p-4 overflow-y-auto">
          {groupLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>{group?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {group?.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>

              <h3 className="font-medium mt-6 mb-2">Members ({group?.members.length || 0})</h3>
              <div className="space-y-3">
                {group?.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user.avatar || undefined} alt={member.user.name} />
                        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">@{member.user.username}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
