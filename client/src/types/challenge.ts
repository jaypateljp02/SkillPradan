export interface Challenge {
  id: number;
  title: string;
  description: string;
  targetCount: number;
  type: string;
  pointsRewarded: number;
  durationDays: number;
  userProgress?: {
    currentCount: number;
    startedAt: string;
    completedAt: string | null;
  } | null;
}

export interface ChallengeCardProps {
  challenge: Challenge;
  className?: string;
}