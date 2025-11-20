import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, Trophy } from "lucide-react";
import { formatDistanceToNow, addDays } from "date-fns";
import { Challenge, ChallengeCardProps } from "@/types/challenge";

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { toast } = useToast();
  
  // Get icon based on challenge type
  const getChallengeIcon = () => {
    if (challenge.type === "exchange") {
      return <Flame className="text-amber-500" />;
    } else if (challenge.type === "verification") {
      return <Award className="text-primary" />;
    } else if (challenge.type === "mentor") {
      return <Trophy className="text-accent" />;
    }
    return <Flame className="text-amber-500" />;
  };
  
  // Get progress percentage
  const getProgressPercentage = () => {
    if (!challenge.userProgress) return 0;
    return Math.min((challenge.userProgress.currentCount / challenge.targetCount) * 100, 100);
  };
  
  // Start challenge mutation
  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", "/api/user-challenges", { challengeId });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to start challenge");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: "Challenge accepted!",
        description: "Good luck with the challenge!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start challenge",
        description: error.message || "Unable to start this challenge. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Get remaining time for challenge
  const getRemainingTime = () => {
    if (!challenge.userProgress) return null;
    
    try {
      const startDate = new Date(challenge.userProgress.startedAt);
      const endDate = addDays(startDate, challenge.durationDays);
      
      if (challenge.userProgress.completedAt) {
        return "Completed";
      }
      
      return formatDistanceToNow(endDate, { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };
  
  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
            {getChallengeIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h5 className="text-base font-semibold text-foreground">{challenge.title}</h5>
            <Badge variant="secondary" className="flex-shrink-0">
              +{challenge.pointsRewarded} pts
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{challenge.description}</p>
          
          {challenge.userProgress ? (
            <>
              <div className="mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Progress</span>
                    <span className="font-semibold text-primary">
                      {challenge.userProgress.currentCount}/{challenge.targetCount}
                    </span>
                  </div>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {getRemainingTime()}
              </div>
            </>
          ) : (
            <div className="mt-3">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => startChallengeMutation.mutate(challenge.id)}
                disabled={startChallengeMutation.isPending}
                data-testid={`button-start-challenge-${challenge.id}`}
              >
                {startChallengeMutation.isPending ? "Starting..." : "Start Challenge"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
