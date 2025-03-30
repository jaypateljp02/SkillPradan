import { cn } from "@/lib/utils";

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
  const colorClasses = {
    primary: "bg-primary bg-opacity-10",
    secondary: "bg-emerald-500 bg-opacity-10",
    accent: "bg-amber-500 bg-opacity-10",
    purple: "bg-purple-100",
    pink: "bg-pink-100"
  };
  
  const iconColorClasses = {
    primary: "text-primary",
    secondary: "text-emerald-600",
    accent: "text-amber-600",
    purple: "text-purple-600",
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
        <i className={cn(`fab fa-${icon} text-2xl`, iconColorClasses[color])}></i>
      </div>
      <h5 className="mt-2 text-sm font-medium text-neutral-900">{name}</h5>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  );
}
