import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/skill-tag";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { CalendarIcon, Clock, MessageSquare, Star, Send } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { ReviewDialog } from "@/components/review-dialog";
import { useAuth } from "@/hooks/use-auth";

interface ExchangeCardProps {
  exchange: any;
  isCurrentUserTeacher: boolean;
}

export function ExchangeCard({ exchange, isCurrentUserTeacher }: ExchangeCardProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("12:00");
  const [duration, setDuration] = useState<string>("60");
  
  // For dialogs
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  
  // Get additional data from exchange relationships
  const { teacherUser, studentUser, teacherSkill, studentSkill } = exchange;

  // Get data about the other user (the person user is exchanging with)
  const otherUser = isCurrentUserTeacher ? studentUser : teacherUser;
  
  // Get data about the skills being exchanged
  const teachingSkill = isCurrentUserTeacher ? teacherSkill : studentSkill;
  const learningSkill = isCurrentUserTeacher ? studentSkill : teacherSkill;
  
  // Update exchange status mutation
  const updateExchangeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/exchanges/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
      toast({
        title: "Exchange updated",
        description: "The exchange status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update exchange",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Schedule session mutation
  const scheduleSessionMutation = useMutation({
    mutationFn: async (data: { exchangeId: number, scheduledTime: string, duration: number }) => {
      const res = await apiRequest("POST", "/api/sessions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session scheduled",
        description: "Your session has been scheduled",
      });
      setScheduleOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to schedule session",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle accepting or declining exchange
  const handleChangeStatus = (status: string) => {
    updateExchangeMutation.mutate({ id: exchange.id, status });
  };
  
  // Handle scheduling a session
  const handleScheduleSession = () => {
    if (!date) {
      toast({
        title: "Select a date",
        description: "Please select a date for the session",
        variant: "destructive",
      });
      return;
    }
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDateTime = new Date(date);
    scheduledDateTime.setHours(hours, minutes);
    
    scheduleSessionMutation.mutate({
      exchangeId: exchange.id,
      scheduledTime: scheduledDateTime.toISOString(),
      duration: parseInt(duration)
    });
  };
  
  // Render the scheduling dialog
  const renderScheduleDialog = () => (
    <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Session</DialogTitle>
          <DialogDescription>
            Schedule your next learning session with {otherUser?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-700">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-700">Time</label>
            <Select defaultValue={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => (
                  <SelectItem key={hour} value={`${hour}:00`}>
                    {`${hour}:00${hour < 12 ? ' AM' : ' PM'}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-700">Duration (minutes)</label>
            <Select defaultValue={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleScheduleSession}
            disabled={scheduleSessionMutation.isPending || !date}
          >
            {scheduleSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render pending exchange actions
  const renderPendingActions = () => {
    if (exchange.status !== "pending") return null;
    
    // If the current user is not the teacher, they're waiting for acceptance
    if (!isCurrentUserTeacher) {
      return (
        <p className="text-sm text-amber-600">Waiting for acceptance</p>
      );
    }
    
    // Current user is the teacher and needs to accept/decline
    return (
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          onClick={() => handleChangeStatus("active")}
          disabled={updateExchangeMutation.isPending}
        >
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleChangeStatus("cancelled")}
          disabled={updateExchangeMutation.isPending}
        >
          Decline
        </Button>
      </div>
    );
  };

  // Get the other user's ID for review purposes
  const otherUserId = otherUser?.id;

  // For checking if the exchange is completed
  const isExchangeCompleted = exchange.status === "completed";
  
  // Handle WebSocket connection for chat
  useEffect(() => {
    if (chatOpen && !wsRef.current) {
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        
        // Join the exchange session
        if (wsRef.current && user) {
          wsRef.current.send(JSON.stringify({
            type: 'join-session',
            payload: {
              sessionId: exchange.id,
              userId: user.id
            }
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat-message' && data.payload.sessionId === exchange.id) {
          setChatMessages(prev => [...prev, {
            message: data.payload.message,
            user: data.payload.userData,
            timestamp: data.payload.timestamp
          }]);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        wsRef.current = null;
      };
    }
    
    return () => {
      // Clean up WebSocket connection when dialog closes
      if (!chatOpen && wsRef.current) {
        if (user) {
          wsRef.current.send(JSON.stringify({
            type: 'leave-session',
            payload: {
              sessionId: exchange.id,
              userId: user.id
            }
          }));
        }
        
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [chatOpen, exchange.id, user]);
  
  // Scroll to bottom of chat when new messages come in
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);
  
  // Handle sending a chat message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !user) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'chat-message',
      payload: {
        sessionId: exchange.id,
        message: newMessage,
        userId: user.id
      }
    }));
    
    setNewMessage("");
  };
  
  // Render the chat dialog
  const renderChatDialog = () => (
    <Dialog open={chatOpen} onOpenChange={setChatOpen}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with {otherUser?.name}</DialogTitle>
          <DialogDescription>
            Discuss your skill exchange and schedule sessions
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 my-2 border border-gray-100 rounded-md bg-gray-50">
          {chatMessages.length === 0 ? (
            <div className="text-center text-neutral-400 my-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.user.id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.user.id === user?.id 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-medium ${msg.user.id === user?.id ? 'text-white/80' : 'text-neutral-500'}`}>
                      {msg.user.name}
                    </span>
                    <span className={`text-xs ${msg.user.id === user?.id ? 'text-white/60' : 'text-neutral-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${msg.user.id === user?.id ? 'text-white' : 'text-neutral-900'}`}>{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            type="button" 
            size="icon"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <UserAvatar 
            src={otherUser?.avatar}
            name={otherUser?.name || "User"}
            size="md"
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-neutral-900">
              With {otherUser?.name || "User"}
            </h4>
            
            {/* Show rating if available */}
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-xs text-neutral-500">
                {otherUser?.rating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>
          
          <p className="mt-1 text-sm text-neutral-500">
            Exchange {exchange.status === "pending" 
              ? "requested" 
              : exchange.status === "completed"
                ? "completed"
                : "started"} {" "}
            {new Date(exchange.createdAt).toLocaleDateString()}
          </p>
          
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500">You're teaching:</p>
              <div className="mt-1 flex">
                <SkillTag 
                  name={teachingSkill?.name || "Skill"} 
                  color="primary"
                />
              </div>
              <div className="mt-2">
                <p className="text-xs text-neutral-500">
                  Progress: {exchange.sessionsCompleted}/{exchange.totalSessions} sessions
                </p>
                <div className="mt-1 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                      style={{ width: `${(exchange.sessionsCompleted / exchange.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">You're learning:</p>
              <div className="mt-1 flex">
                <SkillTag 
                  name={learningSkill?.name || "Skill"} 
                  color="secondary"
                />
              </div>
              <div className="mt-2">
                <p className="text-xs text-neutral-500">
                  Progress: {exchange.sessionsCompleted}/{exchange.totalSessions} sessions
                </p>
                <div className="mt-1 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                      style={{ width: `${(exchange.sessionsCompleted / exchange.totalSessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2 flex-wrap">
            {renderPendingActions()}
            
            {(exchange.status === "active" || exchange.status === "completed") && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex items-center"
                onClick={() => setChatOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            )}
            
            {renderChatDialog()}
            
            {exchange.status === "active" && (
              <>
                <Button 
                  size="sm"
                  className="mr-1"
                  onClick={() => setScheduleOpen(true)}
                >
                  Schedule Next Session
                </Button>
                {renderScheduleDialog()}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/session/${exchange.id}`}>
                    Join Session
                  </Link>
                </Button>
              </>
            )}
            
            {isExchangeCompleted && otherUserId && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
                onClick={() => setReviewOpen(true)}
              >
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                Review {otherUser?.name}
              </Button>
            )}
            
            {/* Review Dialog */}
            {otherUserId && (
              <ReviewDialog
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                userId={otherUserId}
                exchangeId={exchange.id}
                userName={otherUser?.name || "User"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
