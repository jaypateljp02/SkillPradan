import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Calendar,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { format, isToday, isAfter, isBefore, addDays } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type EnrichedSession = {
  id: number;
  scheduledTime: string | Date;
  duration: number;
  status: string;
  exchange: { id: number; status: string };
  otherUser?: { id: number; name: string; avatar?: string };
  isTeacher: boolean;
};

export function LearningSession() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: sessions = [], isLoading } = useQuery<EnrichedSession[]>({
    queryKey: ["/api/sessions"],
  });

  // Update session status mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session updated",
        description: "The session status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update session",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter out upcoming sessions (scheduled and not in the past)
  const upcomingSessions = sessions.filter(session =>
    session.status === "scheduled" &&
    !isBefore(new Date(session.scheduledTime), new Date())
  );

  // Sort by date (closest first)
  upcomingSessions.sort((a, b) =>
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  // Get the next immediate session
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  // Get sessions within the next week
  const comingWeekSessions = upcomingSessions.filter(session =>
    isBefore(new Date(session.scheduledTime), addDays(new Date(), 7))
  );

  // Mark session as completed
  const completeSession = (sessionId: number) => {
    updateSessionMutation.mutate({ id: sessionId, status: "completed" });
  };

  // Reschedule session - this would open a dialog in a real implementation
  const rescheduleSession = (sessionId: number) => {
    toast({
      title: "Reschedule",
      description: "Rescheduling functionality would open a dialog here",
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-neutral-100 rounded-lg"></div>
        <div className="h-32 bg-neutral-100 rounded-lg"></div>
      </div>
    );
  }

  if (!nextSession) {
    return (
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20 shadow-sm">
        <CalendarDays className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-neutral-700">No Upcoming Sessions</h4>
        <p className="text-neutral-500 mt-2">
          You don't have any scheduled learning sessions yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-md font-medium text-neutral-900">Upcoming Sessions</h4>

      {/* Next immediate session with highlight */}
      <div className="mt-4 bg-primary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center">
              <Video className="text-lg text-primary" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h5 className="text-md font-medium text-neutral-900">
                {nextSession.otherUser?.name ?
                  `${nextSession.isTeacher ? 'Teaching' : 'Learning'} with ${nextSession.otherUser.name}` :
                  'Upcoming Session'
                }
              </h5>
              <Badge variant={isToday(new Date(nextSession.scheduledTime)) ? "default" : "outline"}>
                {isToday(new Date(nextSession.scheduledTime)) ? 'Today' : format(new Date(nextSession.scheduledTime), 'EEE, MMM d')}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {format(new Date(nextSession.scheduledTime), "h:mm a")} - {
                format(
                  new Date(new Date(nextSession.scheduledTime).getTime() + nextSession.duration * 60000),
                  "h:mm a"
                )
              }
            </p>

            <div className="mt-4 flex items-center space-x-3">
              <Button
                size="sm"
                asChild
              >
                <Link href={`/session/${nextSession.exchange.id}`}>
                  <Video className="mr-2 h-4 w-4" /> Join Session
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rescheduleSession(nextSession.id)}
              >
                <Calendar className="mr-2 h-4 w-4" /> Reschedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Other upcoming sessions */}
      {comingWeekSessions.slice(1).map(session => (
        <div key={session.id} className="mt-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:shadow-md transition-all duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <UserAvatar
                src={session.otherUser?.avatar}
                name={session.otherUser?.name || "User"}
                size="md"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-md font-medium text-neutral-900">
                  {session.isTeacher ? 'Teaching' : 'Learning'} with {session.otherUser?.name || 'User'}
                </h5>
                <Badge variant="outline">
                  {format(new Date(session.scheduledTime), 'EEE, MMM d')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {format(new Date(session.scheduledTime), "h:mm a")} - {
                  format(
                    new Date(new Date(session.scheduledTime).getTime() + session.duration * 60000),
                    "h:mm a"
                  )
                }
              </p>

              <div className="mt-4 flex items-center">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link href={`/session/${session.exchange.id}`}>
                    Session Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
