import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Star } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  exchangeId: number;
  userName: string;
}

export function ReviewDialog({ 
  open, 
  onOpenChange, 
  userId, 
  exchangeId, 
  userName 
}: ReviewDialogProps) {
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Get existing reviews for this user
  const { data: reviews } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/reviews`],
    enabled: open,
  });
  
  // Form definition
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    }
  });
  
  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", "/api/reviews", {
        ...data,
        reviewedUserId: userId,
        exchangeId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(data: ReviewFormValues) {
    reviewMutation.mutate(data);
  }
  
  // Star rating component
  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Star
            key={rating}
            className={`h-6 w-6 cursor-pointer ${
              (rating <= value)
                ? "text-yellow-400 fill-current"
                : (rating <= hoveredRating)
                  ? "text-yellow-200 fill-current"
                  : "text-neutral-300"
            }`}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onChange(rating)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review {userName}</DialogTitle>
          <DialogDescription>
            Share your experience working with {userName}
          </DialogDescription>
        </DialogHeader>
        
        {reviews && reviews.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Previous Reviews</h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-md p-3 text-sm">
                  <div className="flex items-center mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-neutral-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-neutral-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRating 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your experience..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}