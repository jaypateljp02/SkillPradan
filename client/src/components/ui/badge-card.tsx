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
    primary: "bg-primary/20",
    secondary: "bg-emerald-500/20",
    accent: "bg-amber-500/20",
    purple: "bg-indigo-500/20",
    pink: "bg-pink-500/20"
  };
  
  const iconColorClasses = {
    primary: "text-primary",
    secondary: "text-emerald-600",
    accent: "text-amber-600",
    purple: "text-indigo-600",
    pink: "text-pink-600"
  };

  return (
    <div className={cn(
      "bg-white border border-neutral-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow",
      className
    )}>
      <div className={cn(
        "inline-flex items-center justify-center h-16 w-16 rounded-full",
        colorClasses[color]
      )}>
        <span className={cn(iconColorClasses[color])}>
          {getIcon()}
        </span>
      </div>
      <h5 className="mt-2 text-sm font-medium text-neutral-900">{name}</h5>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  );
}
