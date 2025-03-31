import { useQuery } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/ui/challenge-card";

interface Challenge {
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
  challenge: Challenge;
}

export function ChallengesSection() {
  // Fetch user challenges
  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });
  
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
            title={weeklyChallenge.title}
            description={weeklyChallenge.description}
            progress={{ 
              current: 2, 
              total: weeklyChallenge.totalRequired || 3
            }}
            points={weeklyChallenge.pointsReward}
          />
        )}
        
        {/* Add placeholders if no challenges */}
        {challenges.length === 0 && (
          <>
            <ChallengeCard
              title="Weekly Challenge"
              description="Complete 3 skill exchanges this week"
              progress={{ current: 2, total: 3 }}
              points={200}
            />
            <ChallengeCard
              title="Mentor Challenge"
              description="Help 5 students with their skills"
              progress={{ current: 1, total: 5 }}
              points={300}
            />
          </>
        )}
      </div>
    </div>
  );
}