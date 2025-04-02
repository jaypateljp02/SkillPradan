import { cn } from "@/lib/utils";
import { Award, Code, Flame, Heart, Star, GitBranch, BookOpen } from "lucide-react";

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  color?: "primary" | "secondary" | "accent" | "purple" | "pink";
  className?: string;
}

export function BadgeCard({
  icon,
  name,
  description,
  color = "primary",
  className
}: BadgeCardProps) {
  
  // Get appropriate icon based on the icon name
  const getIcon = () => {
    switch(icon) {
      case 'js-square':
        return <Code className="h-6 w-6" />;
      case 'react':
        return <Star className="h-6 w-6" />;
      case 'chalkboard-teacher':
        return <Award className="h-6 w-6" />;
      case 'fire':
        return <Flame className="h-6 w-6" />;
      case 'code-branch':
        return <GitBranch className="h-6 w-6" />;
      case 'certificate':
        return <Award className="h-6 w-6" />;
      default:
        return <Heart className="h-6 w-6" />;
    }
  };
  const colorClasses = {
    primary: "bg-[hsl(var(--badge-primary)/0.2)]",
    secondary: "bg-[hsl(var(--badge-secondary)/0.2)]",
    accent: "bg-[hsl(var(--badge-accent)/0.2)]",
    purple: "bg-[hsl(var(--badge-purple)/0.2)]",
    pink: "bg-[hsl(var(--badge-pink)/0.2)]"
  };
  
  const iconColorClasses = {
    primary: "text-[hsl(var(--badge-primary))]",
    secondary: "text-[hsl(var(--badge-secondary))]",
    accent: "text-[hsl(var(--badge-accent)/0.8)]",
    purple: "text-[hsl(var(--badge-purple))]",
    pink: "text-[hsl(var(--badge-pink))]"
  };

  return (
    <div className={cn(
      "bg-white border border-neutral-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow h-full flex flex-col items-center",
      className
    )}>
      <div className={cn(
        "inline-flex items-center justify-center h-14 w-14 rounded-full",
        colorClasses[color]
      )}>
        <span className={cn(iconColorClasses[color])}>
          {getIcon()}
        </span>
      </div>
      <h5 className="mt-2 text-sm font-medium text-neutral-900 line-clamp-1 w-full">{name}</h5>
      <p className="text-xs text-neutral-500 line-clamp-2 w-full">{description}</p>
    </div>
  );
}
