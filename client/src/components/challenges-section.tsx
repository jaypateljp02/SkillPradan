import { useQuery } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { Challenge } from "@/types/challenge";

interface ApiChallenge {
  id: number;
  title: string;
  description: string;
  requirement: string;
  pointsReward: number;
  type: string;
  deadline?: string;
  totalRequired: number;
}

interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  challenge: ApiChallenge;
}

export function ChallengesSection() {
  // Fetch user challenges
  const { data: apiChallenges = [], isLoading } = useQuery<ApiChallenge[]>({
    queryKey: ["/api/challenges"],
  });
  
  // Convert API challenges to our Challenge type
  const challenges = apiChallenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    targetCount: c.totalRequired || 3,
    type: c.type || "exchange",
    pointsRewarded: c.pointsReward,
    durationDays: 7,
    userProgress: null
  }));
  
  // Fetch user's progress on challenges
  const { data: userChallenges = [] } = useQuery<UserChallenge[]>({
    queryKey: ["/api/user-challenges"],
  });
  
  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-neutral-100 rounded mb-4 w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // If no user challenges data yet, use a placeholder for weekly challenge
  const weeklyChallenge = challenges.find(c => c.title.includes("Weekly"));
  
  return (
    <div className="mt-8">
      <h4 className="text-md font-medium text-neutral-900">Your Challenges</h4>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {weeklyChallenge && (
          <ChallengeCard
            challenge={{
              ...weeklyChallenge,
              userProgress: {
                currentCount: 2,
                startedAt: new Date().toISOString(),
                completedAt: null
              }
            }}
          />
        )}
        
        {/* Add placeholders if no challenges */}
        {challenges.length === 0 && (
          <>
            <ChallengeCard
              challenge={{
                id: 1,
                title: "Weekly Challenge",
                description: "Complete 3 skill exchanges this week",
                targetCount: 3,
                type: "exchange",
                pointsRewarded: 200,
                durationDays: 7,
                userProgress: {
                  currentCount: 2,
                  startedAt: new Date().toISOString(),
                  completedAt: null
                }
              }}
            />
            <ChallengeCard
              challenge={{
                id: 2,
                title: "Mentor Challenge",
                description: "Help 5 students with their skills",
                targetCount: 5,
                type: "mentor",
                pointsRewarded: 300,
                durationDays: 14,
                userProgress: {
                  currentCount: 1,
                  startedAt: new Date().toISOString(),
                  completedAt: null
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}