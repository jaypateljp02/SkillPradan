import { cn } from "@/lib/utils";

interface SkillTagProps {
  name: string;
  verified?: boolean;
  color?: "primary" | "secondary" | "accent" | "neutral";
  onClick?: () => void;
  className?: string;
}

export function SkillTag({ 
  name, 
  verified = false, 
  color = "neutral", 
  onClick,
  className 
}: SkillTagProps) {
  const colorClasses = {
    primary: "bg-purple-bg text-primary",
    secondary: "bg-emerald-500 bg-opacity-10 text-emerald-600",
    accent: "bg-amber-500 bg-opacity-10 text-amber-600",
    neutral: "bg-neutral-200 text-neutral-700"
  };
  
  const badgeColorClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-emerald-500 text-white",
    accent: "bg-amber-500 text-white",
    neutral: "bg-neutral-400 text-white"
  };
  
  const buttonClass = onClick ? "cursor-pointer hover:-translate-y-1" : "";
  
  return (
    <div 
      className={cn(
        "skill-tag inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-transform duration-200",
        colorClasses[color],
        buttonClass,
        className
      )}
      onClick={onClick}
    >
      <span>{name}</span>
      {verified && (
        <span 
          className={cn(
            "ml-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
            badgeColorClasses[color]
          )} 
          title="Verified Expert"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3 w-3" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
}
