import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  title: string;
  description: string;
  progress: {
    current: number;
    total: number;
  };
  points: number;
  className?: string;
}

export function ChallengeCard({
  title,
  description,
  progress,
  points,
  className
}: ChallengeCardProps) {
  // Calculate progress percentage
  const progressPercentage = (progress.current / progress.total) * 100;
  
  return (
    <div className={cn(
      "bg-white rounded-lg border border-neutral-200 p-5 shadow-sm",
      className
    )}>
      <h3 className="font-medium text-neutral-900">{title}</h3>
      <p className="text-sm text-neutral-600 mt-1">{description}</p>
      
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm text-neutral-700">
          {progress.current}/{progress.total} completed
        </span>
        <span className="text-sm font-medium text-primary">+{points} points</span>
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