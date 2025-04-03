import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  avatarUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  user?: any; // For backward compatibility
}

export function UserAvatar({ src, avatarUrl, name, size = "md", className = "", user }: UserAvatarProps) {
  // Handle both direct props and user object for backward compatibility
  const displayName = user?.name || name || "User";
  const avatarSrc = user?.avatar || avatarUrl || src;
  
  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    
    try {
      return nameStr
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } catch (e) {
      return "U";
    }
  };
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };
  
  const avatarSize = sizeClasses[size];
  
  return (
    <Avatar className={`${avatarSize} ${className}`}>
      <AvatarImage src={avatarSrc} alt={displayName} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
