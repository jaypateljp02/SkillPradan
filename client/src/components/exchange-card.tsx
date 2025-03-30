import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/skill-tag";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CalendarIcon, Clock, MessageSquare, Star } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { ReviewDialog } from "@/components/review-dialog";

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
  
  // Other user is the person you're exchanging with (not you)
  const otherUser = isCurrentUserTeacher 
    ? exchange.studentUser 
    : exchange.teacherUser;
  
  // Skills being exchanged
  const teachingSkill = isCurrentUserTeacher 
    ? exchange.teacherSkill 
    : exchange.studentSkill;
  
  const learningSkill = isCurrentUserTeacher 
    ? exchange.studentSkill 
    : exchange.teacherSkill;
  
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
          
          <div className="mt-4 flex items-center">
            {renderPendingActions()}
            
            {exchange.status === "active" && (
              <>
                <Button 
                  size="sm"
                  className="mr-3"
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
