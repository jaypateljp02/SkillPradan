import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent",
    neutral: "bg-muted text-muted-foreground"
  };
  
  const badgeColorClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    neutral: "bg-muted-foreground text-background"
  };
  
  const buttonClass = onClick ? "cursor-pointer hover-elevate active-elevate-2" : "";
  
  const skillTag = (
    <div 
      className={cn(
        "skill-tag inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-w-0 flex-shrink-0",
        colorClasses[color],
        buttonClass,
        className
      )}
      onClick={onClick}
      data-testid={`skill-tag-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="truncate max-w-[200px]" title={name}>{name}</span>
      {verified && (
        <span 
          className={cn(
            "flex-shrink-0 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
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
  
  // For long skill names, wrap in tooltip
  if (name.length > 20) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {skillTag}
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return skillTag;
}
