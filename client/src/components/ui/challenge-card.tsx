import { cn } from "@/lib/utils";
import { Challenge, ChallengeCardProps } from "@/types/challenge";

export function ChallengeCard({
  challenge,
  className
}: ChallengeCardProps) {
  // Calculate progress percentage
  const progressPercentage = challenge.userProgress 
    ? (challenge.userProgress.currentCount / challenge.targetCount) * 100
    : 0;
  
  return (
    <div className={cn(
      "bg-white rounded-lg border border-neutral-200 p-5 shadow-sm",
      className
    )}>
      <h3 className="font-medium text-neutral-900">{challenge.title}</h3>
      <p className="text-sm text-neutral-600 mt-1">{challenge.description}</p>
      
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm text-neutral-700">
          {challenge.userProgress ? challenge.userProgress.currentCount : 0}/{challenge.targetCount} completed
        </span>
        <span className="text-sm font-medium text-primary">+{challenge.pointsRewarded} points</span>
      </div>
      
      <div className="mt-2 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}