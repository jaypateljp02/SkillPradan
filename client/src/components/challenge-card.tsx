import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Flame, Award } from "lucide-react";
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
    }
    return <Flame className="text-amber-500" />;
  };
  
  // Get progress percentage
  const getProgressPercentage = () => {
    if (!challenge.userProgress) return 0;
    return (challenge.userProgress.currentCount / challenge.targetCount) * 100;
  };
  
  // Start challenge mutation
  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", "/api/user-challenges", { challengeId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: "Challenge accepted",
        description: "Good luck with the challenge!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get remaining time for challenge
  const getRemainingTime = () => {
    if (!challenge.userProgress) return null;
    
    const startDate = new Date(challenge.userProgress.startedAt);
    const endDate = addDays(startDate, challenge.durationDays);
    
    if (challenge.userProgress.completedAt) {
      return "Completed";
    }
    
    return formatDistanceToNow(endDate, { addSuffix: true });
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-amber-500 bg-opacity-20 flex items-center justify-center">
            {getChallengeIcon()}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-md font-medium text-neutral-900">{challenge.title}</h5>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              +{challenge.pointsRewarded} points
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{challenge.description}</p>
          
          {challenge.userProgress ? (
            <>
              <div className="mt-3">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-amber-500">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-amber-500">
                        {Math.round(getProgressPercentage())}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200">
                    <div 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-neutral-500">
                {challenge.userProgress.currentCount}/{challenge.targetCount} {challenge.type === "exchange" ? "exchanges" : "skills"} completed • {getRemainingTime()}
              </div>
            </>
          ) : (
            <div className="mt-3">
              <button 
                className="text-sm text-primary hover:underline"
                onClick={() => startChallengeMutation.mutate(challenge.id)}
                disabled={startChallengeMutation.isPending}
              >
                {startChallengeMutation.isPending ? "Starting challenge..." : "Start challenge"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
