import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface QuickRatingProps {
  userId: number;
  exchangeId: number;
  userName: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  onRated?: () => void;
}

export function QuickRating({ 
  userId, 
  exchangeId, 
  userName,
  compact = false,
  size = "md",
  onRated
}: QuickRatingProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [open, setOpen] = useState(false);
  
  // Size mappings
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  const starSize = sizeClasses[size];
  
  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", "/api/reviews", {
        rating,
        reviewedUserId: userId,
        exchangeId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: `You've rated ${userName} with ${rating} stars`,
      });
      setOpen(false);
      if (onRated) onRated();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const submitRating = () => {
    ratingMutation.mutate(rating);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={compact ? "ghost" : "outline"} 
          size={compact ? "icon" : "sm"} 
          className={compact ? "p-0 h-auto" : "text-yellow-500 bg-yellow-500 bg-opacity-10 hover:bg-opacity-20 border-none"}
        >
          {compact ? (
            <Star className="h-4 w-4 text-yellow-500" />
          ) : (
            <>
              <Star className="mr-1 h-3 w-3" /> Rate Experience
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="center">
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="text-sm font-medium">Rate {userName}</h4>
            <p className="text-xs text-neutral-500">Tap a star to rate</p>
          </div>
          
          <div className="flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`${starSize} cursor-pointer mx-0.5 ${
                  (star <= rating)
                    ? "text-yellow-400 fill-current"
                    : (star <= hoveredRating)
                      ? "text-yellow-200 fill-current"
                      : "text-neutral-300"
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={submitRating}
              disabled={ratingMutation.isPending}
            >
              {ratingMutation.isPending ? "Sending..." : "Submit"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}