import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Save,
  Video
} from "lucide-react";
import { format } from "date-fns";

export function SessionHistory() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/sessions"],
  });
  
  // Filter and sort completed sessions by date (newest first)
  const completedSessions = sessions
    .filter(session => session.status === "completed")
    .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
  
  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded mb-4 w-48"></div>
        <div className="h-32 bg-neutral-100 rounded mb-4"></div>
        <div className="h-32 bg-neutral-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Session History</h4>
      
      <div className="mt-4 space-y-4">
        {completedSessions.length === 0 ? (
          <div className="bg-neutral-50 p-4 rounded-md text-center">
            <p className="text-neutral-500">No completed sessions yet</p>
          </div>
        ) : (
          completedSessions.map(session => (
            <div key={session.id} className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <UserAvatar 
                    src={session.otherUser?.avatar}
                    name={session.otherUser?.name || "User"}
                    size="sm"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-md font-medium text-neutral-900">
                      {session.isTeacher ? 'Teaching' : 'Learning'} with {session.otherUser?.name}
                    </h5>
                    <span className="text-xs text-neutral-500">
                      {format(new Date(session.scheduledTime), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    Duration: {Math.floor(session.duration / 60)}h {session.duration % 60}m
                  </p>
                  
                  <div className="mt-3 flex items-center flex-wrap gap-2">
                    {session.notes && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-primary bg-primary bg-opacity-10 hover:bg-opacity-20 border-none"
                      >
                        <FileText className="mr-1 h-3 w-3" /> Notes
                      </Button>
                    )}
                    
                    {session.whiteboardData && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-emerald-500 bg-emerald-500 bg-opacity-10 hover:bg-opacity-20 border-none"
                      >
                        <Save className="mr-1 h-3 w-3" /> Whiteboard
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-amber-500 bg-amber-500 bg-opacity-10 hover:bg-opacity-20 border-none"
                    >
                      <Video className="mr-1 h-3 w-3" /> Recording
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
