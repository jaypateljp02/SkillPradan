import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ src, name, size = "md", className = "" }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };
  
  const avatarSize = sizeClasses[size];
  
  return (
    <Avatar className={`${avatarSize} ${className}`}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
