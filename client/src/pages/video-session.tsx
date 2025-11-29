import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SocketProvider, useSocket } from "@/hooks/use-socket";
import { useQuery } from "@tanstack/react-query";
import { VideoCall } from "@/components/video-call";
import { Whiteboard } from "@/components/whiteboard";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  Video,
  PencilRuler,
  MessageSquare
} from "lucide-react";
import { formatDistance } from "date-fns";

type EnrichedExchange = {
  id: number;
  teacherId: number;
  studentId: number;
  teacherUser?: { id: number; name: string; avatar?: string };
  studentUser?: { id: number; name: string; avatar?: string };
};

function SessionContent() {
  const { id } = useParams();
  const sessionId = parseInt(id || "0");
  const { user } = useAuth();
  const { joinSession, leaveSession, messages, sendChatMessage } = useSocket();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("video");

  // Get exchange details
  const { data: exchanges = [] } = useQuery<EnrichedExchange[]>({
    queryKey: ["/api/exchanges"],
  });

  const exchange = exchanges.find(ex => ex.id === sessionId);

  // Get the other user
  const otherUser = exchange ? (
    exchange.teacherId === user?.id ? exchange.studentUser : exchange.teacherUser
  ) : null;

  // Join session when component mounts
  useEffect(() => {
    if (sessionId && user) {
      joinSession(sessionId);
    }

    // Leave session when component unmounts
    return () => {
      if (sessionId) {
        leaveSession(sessionId);
      }
    };
  }, [sessionId, user]);

  // Send a chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && sessionId) {
      sendChatMessage(sessionId, message);
      setMessage("");
    }
  };

  if (!exchange) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Session not found</h2>
          <p className="text-neutral-500 mb-4">The session you're looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-premium-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex items-center">
            <h1 className="text-lg font-medium">
              Session with {otherUser?.name || "User"}
            </h1>
          </div>

          <div>
            <UserAvatar
              src={user?.avatar}
              name={user?.name || ""}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full p-4">
          <div className="flex flex-col md:flex-row h-full gap-4">
            {/* Left panel - Video/Whiteboard */}
            <div className="flex-1 min-h-0">
              <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="video">
                    <Video className="h-4 w-4 mr-2" /> Video
                  </TabsTrigger>
                  <TabsTrigger value="whiteboard">
                    <PencilRuler className="h-4 w-4 mr-2" /> Whiteboard
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="h-[calc(100%-44px)]">
                  <VideoCall
                    sessionId={sessionId}
                    username={user?.name || "User"}
                  />
                </TabsContent>

                <TabsContent value="whiteboard" className="h-[calc(100%-44px)]">
                  <Whiteboard sessionId={sessionId} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right panel - Chat */}
            <div className="w-full md:w-80 flex flex-col bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl shadow-lg">
              <div className="p-3 border-b border-white/20">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-neutral-500 mr-2" />
                  <h3 className="font-medium">Chat</h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-neutral-500 mt-4">
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.user.id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.user.id === user?.id ? 'order-2' : 'order-1'}`}>
                        {msg.user.id !== user?.id && (
                          <div className="flex items-center mb-1">
                            <UserAvatar src={msg.user.avatar} name={msg.user.name} size="sm" />
                            <span className="ml-2 text-xs font-medium">{msg.user.name}</span>
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-xl shadow-sm backdrop-blur-sm ${msg.user.id === user?.id
                              ? 'bg-primary text-white rounded-br-none shadow-md'
                              : 'bg-white/80 border border-white/40 rounded-bl-none'
                            }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatDistance(new Date(msg.timestamp), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message input */}
              <div className="p-3 border-t border-white/20 bg-white/40 backdrop-blur-sm rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="ml-2"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoSession() {
  return (
    <SocketProvider>
      <SessionContent />
    </SocketProvider>
  );
}
