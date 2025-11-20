import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Check for user query parameter to auto-select conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    if (userId && !isNaN(parseInt(userId))) {
      const parsedUserId = parseInt(userId);
      // Only set if it's a valid number and not the current user
      if (parsedUserId > 0 && parsedUserId !== user?.id) {
        setSelectedUserId(parsedUserId);
      }
    }
  }, [user]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 5000,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId && !!user,
    refetchInterval: 3000,
  });

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!messages || messages.length === 0 || !user || !selectedUserId) return;
    
    // Find unread messages where the current user is the receiver
    const unreadMessages = messages.filter(
      msg => msg.receiver.id === user.id && !msg.isRead
    );
    
    // Mark each unread message as read
    unreadMessages.forEach(async (msg) => {
      try {
        await apiRequest("PUT", `/api/messages/${msg.id}/read`, {});
        // Invalidate conversations to update unread count
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });
  }, [messages, user, selectedUserId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/messages/${selectedUserId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessage("");
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUserId) return;

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

  // Format date for message timestamps
  const formatMessageTime = (dateString: string) => {
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
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col border-r rounded-none">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </h2>
        </div>

        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet. Start chatting with someone!
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.partner.id}
                  onClick={() => setSelectedUserId(conversation.partner.id)}
                  className={`w-full p-4 text-left hover-elevate active-elevate-2 transition-colors ${
                    selectedUserId === conversation.partner.id ? 'bg-accent' : ''
                  }`}
                  data-testid={`conversation-${conversation.partner.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
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
                          <Badge variant="default" className="h-5 min-w-5 px-1.5">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conversation.lastMessage.sentAt), { 
                          addSuffix: true 
                        })}
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
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={conversations.find(c => c.partner.id === selectedUserId)?.partner.avatar} 
                  />
                  <AvatarFallback>
                    {conversations.find(c => c.partner.id === selectedUserId)?.partner.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {conversations.find(c => c.partner.id === selectedUserId)?.partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{conversations.find(c => c.partner.id === selectedUserId)?.partner.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="text-center text-sm text-muted-foreground">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
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
                        <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          {!isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={msg.sender.avatar} />
                              <AvatarFallback>
                                {msg.sender.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div
                              className={`rounded-md px-3 py-2 ${
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-accent'
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
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
