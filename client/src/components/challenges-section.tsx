import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { Challenge } from "@/types/challenge";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApiChallenge {
  id: number;
  title: string;
  description: string;
  pointsReward: number;
  type: string;
  targetCount: number;
  durationDays: number;
  userProgress?: {
    currentCount: number;
    startedAt: string;
    completedAt: string | null;
  } | null;
}

export function ChallengesSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch challenges with user progress already included
  const { data: apiChallenges = [], isLoading } = useQuery<ApiChallenge[]>({
    queryKey: ["/api/challenges"],
  });

  // Convert API challenges to our Challenge type
  // Convert API challenges to our Challenge type
  const challenges: Challenge[] = apiChallenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    targetCount: c.targetCount || 3,
    type: c.type || "exchange",
    pointsRewarded: c.pointsReward,
    durationDays: c.durationDays || 7,
    userProgress: c.userProgress || null
  }));

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", "/api/user-challenges", { challengeId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Started",
        description: "Good luck! Track your progress here.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to start challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <h4 className="text-md font-medium text-foreground">Loading Challenges...</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show active or available challenges
  const activeChallenges = challenges.filter(c => c.userProgress && !c.userProgress.completedAt);
  const availableChallenges = challenges.filter(c => !c.userProgress || c.userProgress.completedAt);

  return (
    <div className="mt-8" >
      <h4 className="text-md font-medium text-foreground">Your Challenges</h4>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Show active challenges first */}
        {activeChallenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}

        {/* Then show available challenges */}
        {availableChallenges.slice(0, 2 - activeChallenges.length).map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onStart={() => startChallengeMutation.mutate(challenge.id)}
            isStarting={startChallengeMutation.isPending}
          />
        ))}

        {/* Show placeholders if no challenges at all */}
        {challenges.length === 0 && (
          <>
            <div className="p-6 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                No challenges available yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check back soon for new challenges!
              </p>
            </div>
          </>
        )}
      </div>
    </div >
  );
}
