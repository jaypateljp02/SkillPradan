import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LucideIcon } from "lucide-react";

interface PointsCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  points: number;
  color: "primary" | "secondary" | "accent";
  actionHref?: string;
  actionHandler?: () => Promise<void>;
}

export function PointsCard({
  icon: Icon,
  title,
  description,
  points,
  color,
  actionHref,
  actionHandler
}: PointsCardProps) {
  const { toast } = useToast();
  
  const colorClasses = {
    primary: "bg-primary text-white hover:bg-indigo-700",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600",
    accent: "bg-amber-500 text-white hover:bg-amber-600"
  };
  
  const bgColorClasses = {
    primary: "bg-primary bg-opacity-20",
    secondary: "bg-emerald-500 bg-opacity-20",
    accent: "bg-amber-500 bg-opacity-20"
  };
  
  const iconColorClasses = {
    primary: "text-primary",
    secondary: "text-emerald-500",
    accent: "text-amber-500"
  };
  
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (actionHandler) {
        await actionHandler();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: `You earned ${points} points!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 rounded-full ${bgColorClasses[color]} flex items-center justify-center`}>
        <Icon className={`${iconColorClasses[color]}`} />
      </div>
      <h5 className="mt-3 text-md font-medium text-neutral-900">{title}</h5>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-4">
        <Button 
          className={colorClasses[color]}
          size="sm"
          onClick={() => actionHandler && actionMutation.mutate()}
          disabled={actionMutation.isPending}
        >
          {points > 0 ? `+${points} points` : `${Math.abs(points)} points`}
        </Button>
      </div>
    </div>
  );
}
