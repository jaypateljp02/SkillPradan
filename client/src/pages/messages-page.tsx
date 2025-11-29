import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, ArrowLeft, Loader2, User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle, UserPlus, Search, UserCheck, UserX, MoreVertical, Phone, Video } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/ui/mobile-nav";
import { FindFriendsView } from "@/components/find-friends-view";
import { cn } from "@/lib/utils";

interface Conversation {
  partner: {
    id: number;
    name: string;
    avatar: string;
    username: string;
  };
  lastMessage: {
    content: string;
    sentAt: string;
  };
  unreadCount: number;
}

interface Message {
  id: number;
  content: string;
  sentAt: string;
  isRead?: boolean;
  sender: {
    id: number;
    name: string;
    avatar: string;
    username: string;
  };
  receiver: {
    id: number;
    name: string;
    avatar: string;
    username: string;
  };
}

interface Friend {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'find-friends'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("messages");
  const [location, setLocation] = useLocation();

  // Check for user query parameter to auto-select conversation or mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    const mode = params.get('mode');

    if (mode === 'find-friends') {
      setViewMode('find-friends');
      setShowConversationList(false);
    } else if (userId && !isNaN(parseInt(userId))) {
      const parsedUserId = parseInt(userId);
      if (parsedUserId > 0 && parsedUserId !== user?.id) {
        setSelectedUserId(parsedUserId);
        setViewMode('chat');
        setShowConversationList(false);
      }
    }
  }, [user]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      // Authenticate
      socket.send(JSON.stringify({
        type: 'authenticate',
        payload: { userId: user.id }
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'direct-message') {
          const newMessage = data.payload;

          // Update messages cache if we're viewing this conversation
          if (selectedUserId && (newMessage.senderId === selectedUserId || newMessage.receiverId === selectedUserId)) {
            queryClient.setQueryData<Message[]>(["/api/messages", selectedUserId], (old) => {
              if (!old) return [newMessage];
              // Check if message already exists to avoid duplicates
              if (old.some(m => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            });

            // Mark as read if we are the receiver and viewing the chat
            if (newMessage.receiverId === user.id && selectedUserId === newMessage.senderId) {
              apiRequest("PUT", `/api/messages/${newMessage.id}/read`, {});
            }
          }

          // Update conversations list
          queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [user, selectedUserId, queryClient]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // Fetch friends list
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
    enabled: !!user,
  });

  // Fetch received friend requests
  const { data: receivedRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/friends/requests/received"],
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId && !!user && viewMode === 'chat',
    // Removed polling in favor of WebSocket updates
  });

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!messages || messages.length === 0 || !user || !selectedUserId || viewMode !== 'chat') return;

    const unreadMessages = messages.filter(
      msg => msg.receiver.id === user.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(async (msg) => {
        try {
          await apiRequest("PUT", `/api/messages/${msg.id}/read`, {});
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      });
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    }
  }, [messages, user, selectedUserId, viewMode, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) {
        throw new Error("No recipient selected");
      }
      const response = await apiRequest("POST", `/api/messages/${selectedUserId}`, { content });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Unable to send your message. Please try again.",
        variant: "destructive",
      });
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests/received"] });
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!selectedUserId) {
      toast({
        title: "No recipient",
        description: "Please select a conversation first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessageMutation.mutateAsync(message);
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

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "";
    }
  };

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    setViewMode('chat');
    setShowConversationList(false);
  };

  const handleFindFriends = () => {
    setViewMode('find-friends');
    setShowConversationList(false);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const navItems = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Feed',
      icon: <Newspaper className="w-5 h-5" />,
      target: '/feed',
      isRoute: true
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5" />,
      target: '/messages',
      isRoute: true
    },
    {
      label: 'Skill Exchange',
      icon: <Repeat className="w-5 h-5" />,
      target: '/?tab=barter-tab',
      isRoute: true
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5" />,
      target: '/?tab=points-tab',
      isRoute: true
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5" />,
      target: '/?tab=learn-tab',
      isRoute: true
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5" />,
      target: '/?tab=achievements-tab',
      isRoute: true
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5" />,
      target: '/?tab=study-group-tab',
      isRoute: true
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="p-8 text-center glass-card">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view and send messages.</p>
        </Card>
      </div>
    );
  }

  // Get current partner details
  const currentPartner = selectedUserId ? (
    conversations.find(c => c.partner.id === selectedUserId)?.partner ||
    friends.find(f => f.user?.id === selectedUserId)?.user
  ) : null;

  return (
    <div className="min-h-screen bg-premium-gradient flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">

        {/* Top Navigation Bar */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center sm:justify-start">
          {navItems.map((item) => {
            const isActive = location === item.target;
            return (
              <Link key={item.label} href={item.target}>
                <button
                  className={cn(
                    "group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary text-white shadow-lg scale-110 ring-2 ring-primary/20"
                      : "bg-white/40 backdrop-blur-sm border border-white/40 text-neutral-700 hover:bg-white/60 hover:scale-105 hover:shadow-md"
                  )}
                  aria-label={item.label}
                  title={item.label}
                >
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: cn("h-5 w-5 transition-colors", isActive ? "text-white" : "group-hover:text-primary")
                  })}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex glass-card rounded-2xl overflow-hidden shadow-2xl border-0 h-[calc(100vh-12rem)]">

          {/* Sidebar */}
          <div className={cn(
            "w-full md:w-80 flex flex-col border-r border-white/20 bg-white/40 backdrop-blur-md transition-all duration-300",
            showConversationList ? "flex" : "hidden md:flex"
          )}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/20 bg-white/20 backdrop-blur-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <MessageSquare className="w-6 h-6 text-primary" />
                Messages
              </h2>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="w-full grid grid-cols-3 bg-white/30 p-1 rounded-xl">
                  <TabsTrigger value="conversations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Chats</TabsTrigger>
                  <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Friends</TabsTrigger>
                  <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
                    Reqs
                    {receivedRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 mt-2">
                <TabsContent value="conversations" className="m-0 p-2 space-y-1">
                  {conversationsLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs">Loading chats...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No conversations yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start chatting with your friends!</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.partner.id}
                        onClick={() => handleSelectConversation(conversation.partner.id)}
                        className={cn(
                          "w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group",
                          selectedUserId === conversation.partner.id && viewMode === 'chat'
                            ? "bg-primary/10 shadow-sm ring-1 ring-primary/20"
                            : "hover:bg-white/40 hover:shadow-sm"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarImage src={conversation.partner.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-200 text-primary font-bold">
                              {conversation.partner.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                              {conversation.partner.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                              {(() => {
                                try {
                                  const date = new Date(conversation.lastMessage.sentAt);
                                  return isNaN(date.getTime()) ? "" : formatDistanceToNow(date, { addSuffix: false });
                                } catch { return ""; }
                              })()}
                            </span>
                          </div>
                          <p className={cn(
                            "text-xs truncate mt-0.5",
                            conversation.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="friends" className="m-0 p-2 space-y-1">
                  {friendsLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs">Loading friends...</p>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No friends yet</p>
                      <Button variant="link" onClick={handleFindFriends} className="text-primary text-xs mt-1">
                        Find new friends
                      </Button>
                    </div>
                  ) : (
                    friends.map((friendship) => {
                      if (!friendship?.user) return null;
                      return (
                        <button
                          key={friendship.user.id}
                          onClick={() => handleSelectConversation(friendship.user.id)}
                          className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-white/40 hover:shadow-sm transition-all duration-200 group text-left"
                        >
                          <Avatar className="w-10 h-10 border border-white shadow-sm">
                            <AvatarImage src={friendship.user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {friendship.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
                              {friendship.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">@{friendship.user.username}</p>
                          </div>
                          <MessageCircle className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                        </button>
                      );
                    })
                  )}
                </TabsContent>

                <TabsContent value="requests" className="m-0 p-2 space-y-2">
                  {receivedRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-primary/40" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No pending requests</p>
                    </div>
                  ) : (
                    receivedRequests.map((request: any) => (
                      <div key={request.id} className="p-3 bg-white/40 rounded-xl border border-white/20 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10 border border-white">
                            <AvatarImage src={request.user?.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {request.user?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{request.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">@{request.user?.username}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                            onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                            disabled={respondToRequestMutation.isPending}
                          >
                            <UserCheck className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs bg-white/50 hover:bg-white/80"
                            onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                            disabled={respondToRequestMutation.isPending}
                          >
                            <UserX className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-white/20 bg-white/20 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 rounded-xl transition-all",
                    viewMode === 'find-friends'
                      ? "bg-primary text-white shadow-md hover:bg-primary/90 hover:text-white"
                      : "bg-white/50 hover:bg-white/80 text-foreground"
                  )}
                  onClick={handleFindFriends}
                >
                  <Search className="w-4 h-4" />
                  Search New Friends
                </Button>
              </div>
            </Tabs>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 bg-white/30 backdrop-blur-md transition-all duration-300",
            !showConversationList ? "flex" : "hidden md:flex"
          )}>
            {viewMode === 'find-friends' ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/20 bg-white/60 backdrop-blur-md flex items-center gap-3 shadow-sm z-10 md:hidden">
                  <Button variant="ghost" size="icon" onClick={handleBackToList} className="rounded-full hover:bg-black/5">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-bold text-lg">Find Friends</span>
                </div>
                <FindFriendsView />
              </div>
            ) : selectedUserId && currentPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-white/20 bg-white/60 backdrop-blur-md flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden rounded-full hover:bg-black/5"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarImage src={currentPartner.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-200 text-primary font-bold">
                          {currentPartner.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{currentPartner.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                          Online
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 text-muted-foreground">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-white/50 to-white/20">
                  {messagesLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                      <p>Loading conversation...</p>
                    </div>
                  ) : messagesError ? (
                    <div className="flex flex-col items-center justify-center h-full text-destructive">
                      <p>Failed to load messages.</p>
                      <Button variant="link" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] })}>
                        Try again
                      </Button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">No messages yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                        Send a message to start the conversation with {currentPartner.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Group messages by date could be added here */}
                      {messages.map((msg, index) => {
                        const isCurrentUser = msg.sender.id === user.id;
                        const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].sender.id !== msg.sender.id);

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex w-full",
                              isCurrentUser ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className={cn(
                              "flex max-w-[80%] md:max-w-[70%] gap-2",
                              isCurrentUser ? "flex-row-reverse" : "flex-row"
                            )}>
                              {!isCurrentUser && (
                                <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                  {showAvatar ? (
                                    <Avatar className="w-8 h-8 border border-white shadow-sm">
                                      <AvatarImage src={msg.sender.avatar} />
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {msg.sender.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : <div className="w-8" />}
                                </div>
                              )}

                              <div className={cn(
                                "flex flex-col",
                                isCurrentUser ? "items-end" : "items-start"
                              )}>
                                <div className={cn(
                                  "px-4 py-2.5 shadow-sm text-sm break-words relative group",
                                  isCurrentUser
                                    ? "bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl rounded-tr-sm"
                                    : "bg-white border border-white/50 text-foreground rounded-2xl rounded-tl-sm"
                                )}>
                                  {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-70">
                                  {formatMessageTime(msg.sentAt)}
                                  {isCurrentUser && msg.isRead && <span className="ml-1">· Read</span>}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/20 z-10">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Message ${currentPartner.name}...`}
                      disabled={sendMessageMutation.isPending}
                      className="flex-1 bg-white/80 border-white/40 focus:bg-white focus:ring-primary/20 min-h-[44px] py-3 rounded-xl shadow-inner resize-none"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className={cn(
                        "h-11 w-11 rounded-xl shadow-md transition-all duration-200",
                        message.trim()
                          ? "bg-gradient-to-r from-primary to-purple-600 hover:scale-105 hover:shadow-lg"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-white/30 backdrop-blur-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <MessageSquare className="w-12 h-12 text-primary opacity-60" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Your Messages</h2>
                <p className="text-center max-w-md mb-8 leading-relaxed">
                  Connect with other students, share knowledge, and build your network.
                  Select a conversation or find new friends to start chatting.
                </p>
                <Button
                  onClick={handleFindFriends}
                  size="lg"
                  className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-purple-600"
                >
                  <UserPlus className="w-5 h-5" />
                  Find New Friends
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}
