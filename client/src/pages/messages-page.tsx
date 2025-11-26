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
import { Send, MessageSquare, ArrowLeft, Loader2, User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

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

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Check for user query parameter to auto-select conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    if (userId && !isNaN(parseInt(userId))) {
      const parsedUserId = parseInt(userId);
      if (parsedUserId > 0 && parsedUserId !== user?.id) {
        setSelectedUserId(parsedUserId);
        setShowConversationList(false);
      }
    }
  }, [user]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 5000,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId && !!user,
    refetchInterval: 3000,
  });

  // Show error toast when conversation loading fails
  useEffect(() => {
    if (conversationsError) {
      toast({
        title: "Failed to load conversations",
        description: "Unable to fetch your conversations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [conversationsError, toast]);

  // Show error toast when messages loading fails
  useEffect(() => {
    if (messagesError) {
      toast({
        title: "Failed to load messages",
        description: "Unable to fetch messages. Please try again later.",
        variant: "destructive",
      });
    }
  }, [messagesError, toast]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!messages || messages.length === 0 || !user || !selectedUserId) return;

    const unreadMessages = messages.filter(
      msg => msg.receiver.id === user.id && !msg.isRead
    );

    unreadMessages.forEach(async (msg) => {
      try {
        await apiRequest("PUT", `/api/messages/${msg.id}/read`, {});
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });
  }, [messages, user, selectedUserId, queryClient]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please type a message before sending.",
        variant: "destructive",
      });
      return;
    }
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
      // Error already handled in mutation
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
      return "Unknown time";
    }
  };

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    setShowConversationList(false);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="p-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view and send messages.</p>
        </Card>
      </div>
    );
  }

  const navItems = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Feed',
      icon: <Newspaper className="w-5 h-5 text-neutral-700" />,
      target: '/feed',
      isRoute: true
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5 text-neutral-700" />,
      target: '/messages',
      isRoute: true
    },
    {
      label: 'Barter',
      icon: <Repeat className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Find Friends',
      icon: <UserPlus className="w-5 h-5 text-neutral-700" />,
      target: '/find-friends',
      isRoute: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Icon-only navigation buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {navItems.map((item) => {
          const isActive = item.target === '/messages';
          return (
            <Link key={item.label} to={item.target}>
              <button
                className={`flex items-center justify-center w-12 h-12 rounded-md ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                aria-label={item.label}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: "h-6 w-6"
                })}
              </button>
            </Link>
          );
        })}
      </div>

      <div className="flex h-[calc(100vh-16rem)] max-h-[calc(100vh-16rem)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Conversations List */}
        <Card className={`${showConversationList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-r md:rounded-none rounded-none`}>
          <div className="p-4 border-b bg-card">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h2>
          </div>

          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading conversations...</p>
              </div>
            ) : conversationsError ? (
              <div className="p-4 text-center text-sm text-destructive">
                Failed to load conversations. Please refresh the page.
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Start chatting with someone from skill exchange!</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.partner.id}
                    onClick={() => handleSelectConversation(conversation.partner.id)}
                    className={`w-full p-4 text-left hover-elevate active-elevate-2 transition-all ${selectedUserId === conversation.partner.id ? 'bg-accent' : ''
                      }`}
                    data-testid={`conversation-${conversation.partner.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={conversation.partner.avatar} />
                        <AvatarFallback>
                          {conversation.partner.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {conversation.partner.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1.5 flex-shrink-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            try {
                              const date = new Date(conversation.lastMessage.sentAt);
                              if (isNaN(date.getTime())) return "Recently";
                              return formatDistanceToNow(date, { addSuffix: true });
                            } catch {
                              return "Recently";
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <div className={`${!showConversationList ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden flex-shrink-0"
                  onClick={handleBackToList}
                  data-testid="button-back-to-list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage
                    src={conversations.find(c => c.partner.id === selectedUserId)?.partner.avatar}
                  />
                  <AvatarFallback>
                    {conversations.find(c => c.partner.id === selectedUserId)?.partner.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">
                    {conversations.find(c => c.partner.id === selectedUserId)?.partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{conversations.find(c => c.partner.id === selectedUserId)?.partner.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messagesError ? (
                  <div className="text-center text-sm text-destructive py-8">
                    Failed to load messages. Please try again.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.sender.id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            {!isCurrentUser && (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={msg.sender.avatar} />
                                <AvatarFallback>
                                  {msg.sender.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="min-w-0">
                              <div
                                className={`rounded-lg px-3 py-2 ${isCurrentUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-accent text-accent-foreground'
                                  }`}
                              >
                                <p className="text-sm break-words">{msg.content}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                {formatMessageTime(msg.sentAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                    className="flex-shrink-0"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
